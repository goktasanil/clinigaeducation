-- Provider-neutral iyzico state. Existing Stripe data/identifiers remain untouched.
begin;
create table public.portal_iyzico_checkouts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null, kind text not null check(kind in('membership','credits')),
 product_key text not null, currency text not null check(currency in('EUR','TRY')),
 amount_minor integer not null check(amount_minor>0), credits integer not null check(credits>0),
 yearly boolean not null default false, plan_reference text,
 status text not null default 'creating' check(status in('creating','ready','pending','paid','failed','unknown')),
 checkout_token text unique, handoff_hash text unique, form_html text, checkout_url text,
 expires_at timestamptz, created_at timestamptz not null default now(), unique(user_id,request_id)
);
-- Prevent two different idempotency keys racing into simultaneous membership signups.
create unique index portal_iyzico_one_open_membership on public.portal_iyzico_checkouts(user_id)
 where kind='membership' and status in('creating','ready','pending','unknown');
create table public.portal_provider_subscriptions (
 id uuid primary key default gen_random_uuid(), provider text not null check(provider='iyzico'),
 user_id uuid not null references auth.users(id) on delete cascade,
 checkout_id uuid not null references public.portal_iyzico_checkouts(id),
 reference_code text not null, customer_reference text not null, plan_reference text not null,
 plan text not null check(plan in('basic','plus','pro')), yearly boolean not null,
 currency text not null check(currency in('EUR','TRY')), amount_minor integer not null check(amount_minor>0),
 status text not null check(status in('pending','active','past_due','cancelled','expired','inactive')),
 renewals_stopped boolean not null default false, paid_until timestamptz, revoked_at timestamptz,
 updated_at timestamptz not null default now(), unique(provider,reference_code)
);
create index portal_provider_subscription_user on public.portal_provider_subscriptions(user_id,updated_at desc);
create table public.portal_provider_paid_periods (
 provider text not null check(provider='iyzico'), reference_code text not null,
 subscription_id uuid not null references public.portal_provider_subscriptions(id),
 starts_at timestamptz not null, ends_at timestamptz not null,
 created_at timestamptz not null default now(), primary key(provider,reference_code), check(ends_at>starts_at)
);
create table public.portal_iyzico_events (
 event_key text primary key,event_hash text not null,status text not null check(status in('received','processed','failed')),
 created_at timestamptz not null default now(),processed_at timestamptz
);
alter table public.portal_iyzico_checkouts enable row level security;
alter table public.portal_provider_subscriptions enable row level security;
alter table public.portal_provider_paid_periods enable row level security;
alter table public.portal_iyzico_events enable row level security;
revoke all on public.portal_iyzico_checkouts,public.portal_provider_subscriptions,public.portal_provider_paid_periods,public.portal_iyzico_events from public,anon,authenticated;
grant all on public.portal_iyzico_checkouts,public.portal_provider_subscriptions,public.portal_provider_paid_periods,public.portal_iyzico_events to service_role;
grant select on public.portal_provider_subscriptions to authenticated;
create policy portal_provider_subscription_read_own on public.portal_provider_subscriptions for select to authenticated using(user_id=(select auth.uid()));

create function public.portal_iyzico_schema_ready() returns integer language sql security definer set search_path=public as $$ select 20261027; $$;
revoke all on function public.portal_iyzico_schema_ready() from public,anon,authenticated;
grant execute on function public.portal_iyzico_schema_ready() to service_role;

-- Serialize duplicate callback/webhook grants before touching a wallet.
create function public.portal_grant_iyzico_credits(p_user_id uuid,p_amount integer,p_reason text,p_payment_reference text)
returns integer language plpgsql security definer set search_path=public as $$
declare v_balance integer; v_owner uuid;
begin
 if p_user_id is null or p_amount is null or p_amount<=0 or p_amount>10000 or p_reason is null or p_reason not in('membership','credit_pack')
 or p_payment_reference is null or char_length(p_payment_reference) not between 4 and 240 then raise exception 'INVALID_CREDIT_GRANT'; end if;
 perform pg_advisory_xact_lock(hashtextextended('iyzico:'||p_payment_reference,0));
 select user_id,balance_after into v_owner,v_balance from public.portal_credit_transactions where payment_provider='iyzico' and provider_event_id=p_payment_reference;
 if v_owner is not null then
  if v_owner<>p_user_id then raise exception 'PAYMENT_OWNER_MISMATCH'; end if;
  return v_balance;
 end if;
 insert into public.portal_credit_wallets(user_id) values(p_user_id) on conflict(user_id) do nothing;
 update public.portal_credit_wallets set balance=balance+p_amount,lifetime_credited=lifetime_credited+p_amount,updated_at=now() where user_id=p_user_id returning balance into v_balance;
 insert into public.portal_credit_transactions(user_id,direction,amount,reason,payment_provider,provider_event_id,idempotency_key,balance_after,metadata)
 values(p_user_id,'credit',p_amount,p_reason,'iyzico',p_payment_reference,'iyzico:'||p_payment_reference,v_balance,'{}'::jsonb);
 return v_balance;
end; $$;
revoke all on function public.portal_grant_iyzico_credits(uuid,integer,text,text) from public,anon,authenticated;
grant execute on function public.portal_grant_iyzico_credits(uuid,integer,text,text) to service_role;

create function public.portal_iyzico_register_subscription(p_checkout_id uuid,p_reference text,p_customer text,p_status text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_order public.portal_iyzico_checkouts; v_sub public.portal_provider_subscriptions; v_id uuid;
begin
 select * into v_order from public.portal_iyzico_checkouts where id=p_checkout_id for update;
 if v_order.id is null or v_order.kind<>'membership' then raise exception 'CHECKOUT_NOT_FOUND'; end if;
 select * into v_sub from public.portal_provider_subscriptions where provider='iyzico' and reference_code=p_reference for update;
 if v_sub.id is not null and (v_sub.user_id<>v_order.user_id or v_sub.checkout_id<>p_checkout_id or v_sub.customer_reference<>p_customer) then raise exception 'SUBSCRIPTION_OWNER_MISMATCH'; end if;
 insert into public.portal_provider_subscriptions(provider,user_id,checkout_id,reference_code,customer_reference,plan_reference,plan,yearly,currency,amount_minor,status,renewals_stopped)
 values('iyzico',v_order.user_id,p_checkout_id,p_reference,p_customer,v_order.plan_reference,v_order.product_key,v_order.yearly,v_order.currency,v_order.amount_minor,p_status,p_status in('cancelled','expired','inactive'))
 on conflict(provider,reference_code) do update set status=excluded.status,
 renewals_stopped=portal_provider_subscriptions.renewals_stopped or excluded.renewals_stopped,updated_at=now()
 where portal_provider_subscriptions.user_id=excluded.user_id and portal_provider_subscriptions.checkout_id=excluded.checkout_id
 and portal_provider_subscriptions.customer_reference=excluded.customer_reference returning id into v_id;
 if v_id is null then raise exception 'SUBSCRIPTION_OWNER_MISMATCH'; end if;
 update public.portal_iyzico_checkouts set status='pending',form_html=null where id=p_checkout_id and status<>'paid';
 return v_id;
end; $$;
revoke all on function public.portal_iyzico_register_subscription(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.portal_iyzico_register_subscription(uuid,text,text,text) to service_role;

create function public.portal_iyzico_record_period(p_subscription_id uuid,p_reference text,p_start timestamptz,p_end timestamptz)
returns void language plpgsql security definer set search_path=public as $$
declare v_sub public.portal_provider_subscriptions; v_order public.portal_iyzico_checkouts; v_existing uuid;
begin
 if p_subscription_id is null or p_reference is null or char_length(p_reference) not between 4 and 240 or p_start is null or p_end is null or p_end<=p_start or p_start>now()+interval '1 day' then raise exception 'INVALID_PAID_PERIOD'; end if;
 perform pg_advisory_xact_lock(hashtextextended('iyzico-period:'||p_reference,0));
 select subscription_id into v_existing from public.portal_provider_paid_periods where provider='iyzico' and reference_code=p_reference;
 if v_existing is not null then
  if v_existing<>p_subscription_id then raise exception 'PERIOD_OWNER_MISMATCH'; end if;
  return;
 end if;
 select * into v_sub from public.portal_provider_subscriptions where id=p_subscription_id for update;
 select * into v_order from public.portal_iyzico_checkouts where id=v_sub.checkout_id;
 if v_sub.id is null or v_sub.revoked_at is not null then raise exception 'SUBSCRIPTION_NOT_AVAILABLE'; end if;
 insert into public.portal_provider_paid_periods(provider,reference_code,subscription_id,starts_at,ends_at) values('iyzico',p_reference,v_sub.id,p_start,p_end);
 perform public.portal_grant_iyzico_credits(v_sub.user_id,v_order.credits,'membership','period:'||p_reference);
 update public.portal_provider_subscriptions set paid_until=greatest(coalesce(paid_until,p_end),p_end),updated_at=now() where id=v_sub.id;
 update public.portal_iyzico_checkouts set status='paid',form_html=null where id=v_order.id;
end; $$;
revoke all on function public.portal_iyzico_record_period(uuid,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.portal_iyzico_record_period(uuid,text,timestamptz,timestamptz) to service_role;

create function public.portal_iyzico_apply_credit_payment(p_checkout_id uuid,p_payment_reference text)
returns void language plpgsql security definer set search_path=public as $$
declare v_order public.portal_iyzico_checkouts;
begin
 select * into v_order from public.portal_iyzico_checkouts where id=p_checkout_id for update;
 if v_order.id is null or v_order.kind<>'credits' then raise exception 'CHECKOUT_NOT_FOUND'; end if;
 perform public.portal_grant_iyzico_credits(v_order.user_id,v_order.credits,'credit_pack','payment:'||p_payment_reference);
 update public.portal_iyzico_checkouts set status='paid',form_html=null where id=p_checkout_id;
end; $$;
revoke all on function public.portal_iyzico_apply_credit_payment(uuid,text) from public,anon,authenticated;
grant execute on function public.portal_iyzico_apply_credit_payment(uuid,text) to service_role;

-- Renewal cancellation does not erase access to a period already paid for.
create function public.portal_has_paid_access(p_user_id uuid)
returns boolean language plpgsql stable security definer set search_path=public as $$
begin
 if p_user_id is null then return false; end if;
 if coalesce(auth.role(),'')<>'service_role' and p_user_id is distinct from auth.uid() then return false; end if;
 return exists(select 1 from public.portal_subscriptions where user_id=p_user_id and status='active'
  and plan in('basic','plus','pro') and (current_period_end is null or current_period_end>now()))
 or exists(select 1 from public.portal_provider_subscriptions where user_id=p_user_id and paid_until>now() and revoked_at is null);
end; $$;
revoke all on function public.portal_has_paid_access(uuid) from public,anon;
grant execute on function public.portal_has_paid_access(uuid) to authenticated,service_role;

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

  if not public.portal_has_paid_access(v_user_id) then raise exception 'ACTIVE_PAID_MEMBERSHIP_REQUIRED'; end if;

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
revoke execute on function public.portal_create_paid_listing_v2(text,text,text,text,text,text,text,numeric,text,text) from public,anon;
grant execute on function public.portal_create_paid_listing_v2(text,text,text,text,text,text,text,numeric,text,text) to authenticated;

create function public.portal_current_paid_access()
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_result jsonb; v_user uuid:=auth.uid();
begin
 if v_user is null then return null; end if;
 select item into v_result from (
  select jsonb_build_object('provider','stripe','plan',plan,'status','active',
    'current_period_end',current_period_end,'cancel_at_period_end',cancel_at_period_end,
    'provider_status',status,'has_access',true) as item,
    case plan when 'pro' then 3 when 'plus' then 2 else 1 end as priority
   from public.portal_subscriptions where user_id=v_user and status='active'
    and plan in('basic','plus','pro') and (current_period_end is null or current_period_end>now())
  union all
  select jsonb_build_object('provider','iyzico','plan',plan,'status','active',
    'current_period_end',paid_until,'cancel_at_period_end',renewals_stopped,
    'provider_status',status,'has_access',true) as item,
    case plan when 'pro' then 3 when 'plus' then 2 else 1 end as priority
   from public.portal_provider_subscriptions where user_id=v_user and paid_until>now() and revoked_at is null
 ) available order by priority desc limit 1;
 return v_result;
end; $$;
revoke all on function public.portal_current_paid_access() from public,anon;
grant execute on function public.portal_current_paid_access() to authenticated;

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

  if not public.portal_has_paid_access(v_user_id) then
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
revoke execute on function public.portal_create_paid_listing(text,text,text,text,text,text,text,text) from public,anon,authenticated;
commit;
