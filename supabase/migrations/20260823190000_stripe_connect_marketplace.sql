-- Stripe Billing + Connect destination-charge foundation.

create table if not exists public.portal_connect_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_account_id text not null unique,
  country_code text not null check (char_length(country_code) = 2),
  status text not null default 'onboarding'
    check (status in ('onboarding', 'pending', 'active', 'restricted', 'disabled')),
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  capabilities jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.portal_listings(id) on delete restrict,
  buyer_id uuid not null references auth.users(id) on delete restrict,
  seller_id uuid not null references auth.users(id) on delete restrict,
  amount_minor integer not null check (amount_minor >= 100),
  platform_fee_minor integer not null check (platform_fee_minor >= 0 and platform_fee_minor < amount_minor),
  currency text not null default 'eur' check (currency = lower(currency) and char_length(currency) = 3),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded', 'disputed', 'cancelled', 'failed')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  stripe_charge_id text unique,
  stripe_dispute_id text unique,
  idempotency_key text not null unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);

create table if not exists public.portal_stripe_events (
  event_id text primary key,
  event_type text not null,
  status text not null check (status in ('processing', 'processed', 'failed')),
  last_error text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists portal_marketplace_orders_buyer_idx
  on public.portal_marketplace_orders (buyer_id, created_at desc);
create index if not exists portal_marketplace_orders_seller_idx
  on public.portal_marketplace_orders (seller_id, created_at desc);
create index if not exists portal_marketplace_orders_listing_idx
  on public.portal_marketplace_orders (listing_id, created_at desc);

drop trigger if exists portal_connect_accounts_updated_at on public.portal_connect_accounts;
create trigger portal_connect_accounts_updated_at
before update on public.portal_connect_accounts
for each row execute function public.portal_set_updated_at();

drop trigger if exists portal_marketplace_orders_updated_at on public.portal_marketplace_orders;
create trigger portal_marketplace_orders_updated_at
before update on public.portal_marketplace_orders
for each row execute function public.portal_set_updated_at();

alter table public.portal_connect_accounts enable row level security;
alter table public.portal_marketplace_orders enable row level security;
alter table public.portal_stripe_events enable row level security;

revoke all on public.portal_connect_accounts, public.portal_marketplace_orders, public.portal_stripe_events
from anon, authenticated;
grant select on public.portal_connect_accounts, public.portal_marketplace_orders to authenticated;
grant select, insert, update, delete on public.portal_connect_accounts, public.portal_marketplace_orders, public.portal_stripe_events to service_role;

create policy "portal_connect_accounts_select_own"
  on public.portal_connect_accounts for select to authenticated
  using (user_id = (select auth.uid()));
create policy "portal_marketplace_orders_select_participant"
  on public.portal_marketplace_orders for select to authenticated
  using (buyer_id = (select auth.uid()) or seller_id = (select auth.uid()));

create or replace function public.portal_grant_stripe_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_provider_event_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_user_id is null or p_amount <= 0 then raise exception 'INVALID_CREDIT_GRANT'; end if;
  if p_reason not in ('membership', 'credit_pack') then raise exception 'INVALID_CREDIT_REASON'; end if;
  if p_provider_event_id is null or char_length(p_provider_event_id) < 4 then
    raise exception 'PROVIDER_EVENT_ID_REQUIRED';
  end if;

  select balance_after into v_balance
  from public.portal_credit_transactions
  where payment_provider = 'stripe' and provider_event_id = p_provider_event_id;
  if v_balance is not null then return v_balance; end if;

  insert into public.portal_credit_wallets (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  update public.portal_credit_wallets
  set balance = balance + p_amount,
      lifetime_credited = lifetime_credited + p_amount,
      updated_at = now()
  where user_id = p_user_id
  returning balance into v_balance;

  insert into public.portal_credit_transactions (
    user_id, direction, amount, reason, payment_provider, provider_event_id,
    idempotency_key, balance_after, metadata
  ) values (
    p_user_id, 'credit', p_amount, p_reason, 'stripe', p_provider_event_id,
    'stripe:' || p_provider_event_id, v_balance, coalesce(p_metadata, '{}'::jsonb)
  );

  return v_balance;
exception
  when unique_violation then
    select balance_after into v_balance
    from public.portal_credit_transactions
    where payment_provider = 'stripe' and provider_event_id = p_provider_event_id;
    return v_balance;
end;
$$;

revoke all on function public.portal_grant_stripe_credits(uuid,integer,text,text,jsonb) from public;
grant execute on function public.portal_grant_stripe_credits(uuid,integer,text,text,jsonb) to service_role;

create or replace function public.portal_create_paid_listing_v2(
  p_kind text,
  p_title text,
  p_description text,
  p_country_code text,
  p_city text,
  p_institution text default null,
  p_program text default null,
  p_price_amount numeric default null,
  p_currency text default 'EUR',
  p_idempotency_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cost integer;
  v_balance integer;
  v_listing_id uuid;
  v_existing uuid;
  v_duration integer;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_idempotency_key is null or char_length(p_idempotency_key) < 8 then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED';
  end if;
  if p_price_amount is not null and (p_price_amount < 1 or p_price_amount > 1000000) then
    raise exception 'INVALID_LISTING_PRICE';
  end if;
  if upper(p_currency) <> 'EUR' then raise exception 'UNSUPPORTED_LISTING_CURRENCY'; end if;

  select reference_id into v_existing
  from public.portal_credit_transactions
  where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if v_existing is not null then return v_existing; end if;

  if not exists (
    select 1 from public.portal_subscriptions
    where user_id = v_user_id and status = 'active' and plan in ('basic', 'plus', 'pro')
      and (current_period_end is null or current_period_end > now())
  ) then raise exception 'ACTIVE_PAID_MEMBERSHIP_REQUIRED'; end if;

  if not exists (
    select 1 from public.portal_profiles
    where user_id = v_user_id and verification_status = 'verified' and suspended_at is null
  ) then raise exception 'VERIFIED_ACCOUNT_REQUIRED'; end if;

  select credit_cost, default_duration_days into v_cost, v_duration
  from public.portal_listing_prices where kind = p_kind and active = true;
  if v_cost is null then raise exception 'LISTING_CATEGORY_NOT_AVAILABLE'; end if;

  update public.portal_credit_wallets
  set balance = balance - v_cost, lifetime_spent = lifetime_spent + v_cost, updated_at = now()
  where user_id = v_user_id and balance >= v_cost
  returning balance into v_balance;
  if v_balance is null then raise exception 'INSUFFICIENT_CREDITS'; end if;

  insert into public.portal_listings (
    owner_id, kind, title, description, country_code, city, institution, program,
    price_amount, currency, status, verified, credit_cost, payment_state, idempotency_key, expires_at
  ) values (
    v_user_id, p_kind, trim(p_title), trim(p_description), upper(p_country_code), trim(p_city),
    nullif(trim(p_institution), ''), nullif(trim(p_program), ''), p_price_amount,
    upper(p_currency), 'moderation_pending', false, v_cost, 'paid_with_credits',
    p_idempotency_key, now() + make_interval(days => v_duration)
  ) returning id into v_listing_id;

  insert into public.portal_credit_transactions (
    user_id, direction, amount, reason, reference_id, idempotency_key, balance_after, metadata
  ) values (
    v_user_id, 'debit', v_cost, 'listing', v_listing_id, p_idempotency_key, v_balance,
    jsonb_build_object('kind', p_kind, 'price_amount', p_price_amount, 'currency', upper(p_currency))
  );
  insert into public.portal_audit_events (actor_id, event_type, target_type, target_id, metadata)
  values (v_user_id, 'listing.credit_debited', 'listing', v_listing_id, jsonb_build_object('credits', v_cost));
  return v_listing_id;
end;
$$;

revoke all on function public.portal_create_paid_listing_v2(text,text,text,text,text,text,text,numeric,text,text) from public;
grant execute on function public.portal_create_paid_listing_v2(text,text,text,text,text,text,text,numeric,text,text) to authenticated;
