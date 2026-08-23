-- Paid verified marketplace foundation for CliniGA Global Student Portal.
-- Membership and listing publication are separate paid actions.
begin;

alter table public.portal_profiles
  add column if not exists account_role text not null default 'student',
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists verification_reviewed_at timestamptz,
  add column if not exists suspended_at timestamptz;

alter table public.portal_profiles
  drop constraint if exists portal_profiles_account_role_check;
alter table public.portal_profiles
  add constraint portal_profiles_account_role_check
  check (account_role in ('student', 'advertiser', 'institution', 'moderator', 'admin'));

alter table public.portal_profiles
  drop constraint if exists portal_profiles_verification_status_check;
alter table public.portal_profiles
  add constraint portal_profiles_verification_status_check
  check (verification_status in ('unverified', 'pending', 'verified', 'rejected', 'suspended'));

create or replace function public.portal_protect_profile_trust_fields()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    if tg_op = 'INSERT' then
      new.account_role = 'student';
      new.verification_status = 'unverified';
      new.verification_reviewed_at = null;
      new.suspended_at = null;
    else
      new.account_role = old.account_role;
      new.verification_status = old.verification_status;
      new.verification_reviewed_at = old.verification_reviewed_at;
      new.suspended_at = old.suspended_at;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists portal_profile_trust_guard on public.portal_profiles;
create trigger portal_profile_trust_guard
before insert or update on public.portal_profiles
for each row execute function public.portal_protect_profile_trust_fields();

alter table public.portal_subscriptions
  alter column plan set default 'basic';
update public.portal_subscriptions set plan = 'basic' where plan = 'free';
alter table public.portal_subscriptions
  drop constraint if exists portal_subscriptions_plan_check;
alter table public.portal_subscriptions
  add constraint portal_subscriptions_plan_check
  check (plan in ('basic', 'plus', 'pro'));

create table if not exists public.portal_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_role text not null check (requested_role in ('student', 'advertiser', 'institution')),
  document_storage_path text not null,
  document_type text not null,
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected', 'cancelled')),
  reviewer_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (user_id, status) deferrable initially immediate
);

create table if not exists public.portal_credit_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  lifetime_credited integer not null default 0 check (lifetime_credited >= 0),
  lifetime_spent integer not null default 0 check (lifetime_spent >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  direction text not null check (direction in ('credit', 'debit')),
  amount integer not null check (amount > 0),
  reason text not null check (reason in ('membership', 'credit_pack', 'listing', 'refund', 'adjustment')),
  reference_id uuid,
  payment_provider text,
  provider_event_id text,
  idempotency_key text not null,
  balance_after integer not null check (balance_after >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  unique nulls not distinct (payment_provider, provider_event_id)
);

create table if not exists public.portal_listing_prices (
  kind text primary key,
  credit_cost integer not null check (credit_cost > 0),
  default_duration_days integer not null default 30 check (default_duration_days between 1 and 365),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.portal_listing_prices (kind, credit_cost, default_duration_days)
values
  ('housing', 12, 30),
  ('dormitory', 18, 45),
  ('scholarships', 8, 45),
  ('marketplace', 5, 30),
  ('roommates', 7, 30),
  ('community', 6, 30),
  ('jobs', 10, 30),
  ('services', 12, 30)
on conflict (kind) do update
set credit_cost = excluded.credit_cost,
    default_duration_days = excluded.default_duration_days,
    updated_at = now();

alter table public.portal_listings
  add column if not exists credit_cost integer not null default 0 check (credit_cost >= 0),
  add column if not exists payment_state text not null default 'legacy',
  add column if not exists idempotency_key text,
  add column if not exists global_scope boolean not null default false;

alter table public.portal_listings
  drop constraint if exists portal_listings_kind_check;
alter table public.portal_listings
  add constraint portal_listings_kind_check
  check (kind in ('housing', 'dormitory', 'scholarships', 'marketplace', 'roommates', 'community', 'jobs', 'services'));

alter table public.portal_listings
  drop constraint if exists portal_listings_status_check;
update public.portal_listings
set status = case status
  when 'review' then 'moderation_pending'
  when 'published' then 'active'
  when 'closed' then 'archived'
  else status
end;
alter table public.portal_listings
  add constraint portal_listings_status_check
  check (status in ('draft', 'payment_pending', 'verification_pending', 'moderation_pending', 'active', 'rejected', 'expired', 'archived'));

alter table public.portal_listings
  drop constraint if exists portal_listings_payment_state_check;
alter table public.portal_listings
  add constraint portal_listings_payment_state_check
  check (payment_state in ('legacy', 'pending', 'paid_with_credits', 'refunded'));

create unique index if not exists portal_listings_owner_idempotency_idx
  on public.portal_listings(owner_id, idempotency_key)
  where idempotency_key is not null;

create table if not exists public.portal_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.portal_listings(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (reporter_id, listing_id, reason)
);

create table if not exists public.portal_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.portal_listings(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewee_id uuid not null references auth.users(id) on delete cascade,
  interaction_reference text not null,
  rating smallint not null check (rating between 1 and 5),
  body text check (body is null or char_length(body) between 10 and 1000),
  status text not null default 'published' check (status in ('published', 'hidden', 'removed')),
  created_at timestamptz not null default now(),
  unique (reviewer_id, interaction_reference),
  check (reviewer_id <> reviewee_id)
);

create table if not exists public.portal_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid references auth.users(id) on delete set null,
  target_type text not null check (target_type in ('user', 'verification', 'listing', 'report', 'review')),
  target_id uuid not null,
  action text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.portal_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  target_type text,
  target_id uuid,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.portal_credit_transactions_immutable()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  raise exception 'Credit ledger entries are immutable';
end;
$$;

drop trigger if exists portal_credit_transactions_immutable_guard on public.portal_credit_transactions;
create trigger portal_credit_transactions_immutable_guard
before update or delete on public.portal_credit_transactions
for each row execute function public.portal_credit_transactions_immutable();

create or replace function public.portal_protect_listing_moderation()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    if tg_op = 'INSERT' then
      new.verified = false;
      new.status = case
        when new.payment_state = 'paid_with_credits' then 'moderation_pending'
        else 'payment_pending'
      end;
    else
      new.verified = old.verified;
      new.status = old.status;
      new.payment_state = old.payment_state;
      new.credit_cost = old.credit_cost;
      new.idempotency_key = old.idempotency_key;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.portal_create_paid_listing(
  p_kind text,
  p_title text,
  p_description text,
  p_country_code text,
  p_city text,
  p_institution text default null,
  p_program text default null,
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
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_idempotency_key is null or char_length(p_idempotency_key) < 8 then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED';
  end if;

  select reference_id into v_existing
  from public.portal_credit_transactions
  where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if v_existing is not null then
    return v_existing;
  end if;

  if not exists (
    select 1 from public.portal_subscriptions
    where user_id = v_user_id
      and status = 'active'
      and plan in ('basic', 'plus', 'pro')
      and (current_period_end is null or current_period_end > now())
  ) then
    raise exception 'ACTIVE_PAID_MEMBERSHIP_REQUIRED';
  end if;

  if not exists (
    select 1 from public.portal_profiles
    where user_id = v_user_id
      and verification_status = 'verified'
      and suspended_at is null
  ) then
    raise exception 'VERIFIED_ACCOUNT_REQUIRED';
  end if;

  select credit_cost, default_duration_days into v_cost, v_duration
  from public.portal_listing_prices
  where kind = p_kind and active = true;
  if v_cost is null then
    raise exception 'LISTING_CATEGORY_NOT_AVAILABLE';
  end if;

  update public.portal_credit_wallets
  set balance = balance - v_cost,
      lifetime_spent = lifetime_spent + v_cost,
      updated_at = now()
  where user_id = v_user_id and balance >= v_cost
  returning balance into v_balance;
  if v_balance is null then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  insert into public.portal_listings (
    owner_id, kind, title, description, country_code, city, institution, program,
    status, verified, credit_cost, payment_state, idempotency_key, expires_at
  ) values (
    v_user_id, p_kind, trim(p_title), trim(p_description), upper(p_country_code),
    trim(p_city), nullif(trim(p_institution), ''), nullif(trim(p_program), ''),
    'moderation_pending', false, v_cost, 'paid_with_credits', p_idempotency_key,
    now() + make_interval(days => v_duration)
  )
  returning id into v_listing_id;

  insert into public.portal_credit_transactions (
    user_id, direction, amount, reason, reference_id, idempotency_key, balance_after, metadata
  ) values (
    v_user_id, 'debit', v_cost, 'listing', v_listing_id, p_idempotency_key, v_balance,
    jsonb_build_object('kind', p_kind)
  );

  insert into public.portal_audit_events (actor_id, event_type, target_type, target_id, metadata)
  values (v_user_id, 'listing.credit_debited', 'listing', v_listing_id, jsonb_build_object('credits', v_cost));

  return v_listing_id;
end;
$$;

alter table public.portal_verification_requests enable row level security;
alter table public.portal_credit_wallets enable row level security;
alter table public.portal_credit_transactions enable row level security;
alter table public.portal_listing_prices enable row level security;
alter table public.portal_reports enable row level security;
alter table public.portal_reviews enable row level security;
alter table public.portal_moderation_actions enable row level security;
alter table public.portal_audit_events enable row level security;

revoke all on table
  public.portal_verification_requests,
  public.portal_credit_wallets,
  public.portal_credit_transactions,
  public.portal_listing_prices,
  public.portal_reports,
  public.portal_reviews,
  public.portal_moderation_actions,
  public.portal_audit_events
from anon, authenticated;

grant select on public.portal_listing_prices to anon, authenticated;
grant select on public.portal_credit_wallets, public.portal_credit_transactions to authenticated;
grant select, insert on public.portal_verification_requests, public.portal_reports to authenticated;
grant select, insert on public.portal_reviews to authenticated;
grant execute on function public.portal_create_paid_listing(text, text, text, text, text, text, text, text) to authenticated;

grant select, insert, update, delete on table
  public.portal_verification_requests,
  public.portal_credit_wallets,
  public.portal_credit_transactions,
  public.portal_listing_prices,
  public.portal_reports,
  public.portal_reviews,
  public.portal_moderation_actions,
  public.portal_audit_events
to service_role;

drop policy if exists "portal_listings_read_published_or_own" on public.portal_listings;
create policy "portal_listings_read_active_or_own"
  on public.portal_listings for select to anon, authenticated
  using (status = 'active' or owner_id = (select auth.uid()));

create policy "portal_verification_select_own"
  on public.portal_verification_requests for select to authenticated
  using (user_id = (select auth.uid()));
create policy "portal_verification_insert_own"
  on public.portal_verification_requests for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

create policy "portal_wallet_select_own"
  on public.portal_credit_wallets for select to authenticated
  using (user_id = (select auth.uid()));
create policy "portal_credit_transactions_select_own"
  on public.portal_credit_transactions for select to authenticated
  using (user_id = (select auth.uid()));
create policy "portal_listing_prices_read"
  on public.portal_listing_prices for select to anon, authenticated
  using (active = true);

create policy "portal_reports_select_own"
  on public.portal_reports for select to authenticated
  using (reporter_id = (select auth.uid()));
create policy "portal_reports_insert_own"
  on public.portal_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));

create policy "portal_reviews_read_published"
  on public.portal_reviews for select to authenticated
  using (status = 'published');
create policy "portal_reviews_insert_after_interaction"
  on public.portal_reviews for insert to authenticated
  with check (
    reviewer_id = (select auth.uid())
    and exists (
      select 1 from public.portal_messages m
      where m.listing_id = portal_reviews.listing_id
        and (m.sender_id = (select auth.uid()) or m.recipient_id = (select auth.uid()))
    )
  );

create index if not exists portal_credit_transactions_user_created_idx
  on public.portal_credit_transactions(user_id, created_at desc);
create index if not exists portal_verification_status_idx
  on public.portal_verification_requests(status, submitted_at);
create index if not exists portal_reports_status_idx
  on public.portal_reports(status, created_at);
create index if not exists portal_reviews_listing_idx
  on public.portal_reviews(listing_id, created_at desc);
create index if not exists portal_audit_target_idx
  on public.portal_audit_events(target_type, target_id, created_at desc);

commit;
