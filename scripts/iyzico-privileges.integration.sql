-- Disposable local database only. Synthetic fixtures always roll back.
-- Use an administrative test connection so SET ROLE exercises real API grants/RLS.
begin;
insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-000000000051','rls-one@example.invalid'),
 ('00000000-0000-4000-8000-000000000052','rls-two@example.invalid');
select set_config('request.jwt.claims','{"role":"service_role"}',true);
insert into public.portal_iyzico_checkouts(id,user_id,request_id,provider_mode,kind,product_key,currency,amount_minor,credits,status,plan_reference)
values
 ('00000000-0000-4000-8000-000000000061','00000000-0000-4000-8000-000000000051','00000000-0000-4000-8000-000000000071','live','membership','basic','EUR',499,10,'ready','fixture-rls-plan'),
 ('00000000-0000-4000-8000-000000000062','00000000-0000-4000-8000-000000000052','00000000-0000-4000-8000-000000000072','live','membership','plus','EUR',899,20,'ready','fixture-rls-plan-two');
select public.portal_iyzico_register_subscription('00000000-0000-4000-8000-000000000061','fixture-rls-one','fixture-rls-customer-one','active');
select public.portal_iyzico_register_subscription('00000000-0000-4000-8000-000000000062','fixture-rls-two','fixture-rls-customer-two','active');
select public.portal_iyzico_record_period(id,'fixture-rls-period-one',now()-interval '1 hour',now()+interval '28 days') from public.portal_provider_subscriptions where reference_code='fixture-rls-one';
select public.portal_iyzico_record_period(id,'fixture-rls-period-two',now()-interval '1 hour',now()+interval '28 days') from public.portal_provider_subscriptions where reference_code='fixture-rls-two';
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000051"}',true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.portal_provider_subscriptions)<>1 then raise exception 'RLS did not filter foreign subscription'; end if;
 if exists(select 1 from public.portal_provider_subscriptions where user_id<>'00000000-0000-4000-8000-000000000051') then raise exception 'RLS leaked foreign subscription'; end if;
 if public.portal_has_paid_access('00000000-0000-4000-8000-000000000051') is distinct from true then raise exception 'Own paid access missing'; end if;
 if public.portal_has_paid_access('00000000-0000-4000-8000-000000000052') is distinct from false then raise exception 'Foreign paid access leaked'; end if;
 if public.portal_current_paid_access()->>'plan' is distinct from 'basic' then raise exception 'Current access returned foreign plan'; end if;
 begin
  perform 1 from public.portal_iyzico_checkouts;
  raise exception 'Checkout internals readable by authenticated';
 exception when insufficient_privilege then null; end;
 begin
  perform public.portal_grant_iyzico_credits('00000000-0000-4000-8000-000000000051',25,'credit_pack','unauthorized-credit');
  raise exception 'Authenticated role granted credits';
 exception when insufficient_privilege then null; end;
 begin
  update public.portal_provider_subscriptions set plan='pro' where user_id='00000000-0000-4000-8000-000000000051';
  raise exception 'Authenticated role changed subscription';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
-- The current-access RPC merges providers for the same owner and prefers higher tiers.
select set_config('request.jwt.claims','{"role":"service_role"}',true);
insert into public.portal_subscriptions(user_id,plan,status,current_period_end,stripe_subscription_id)
values('00000000-0000-4000-8000-000000000051','pro','active',now()+interval '14 days','fixture-rls-stripe');
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000051"}',true);
set local role authenticated;
do $$ begin
 if public.portal_current_paid_access()->>'provider' is distinct from 'stripe' or public.portal_current_paid_access()->>'plan' is distinct from 'pro' then
  raise exception 'Highest own cross-provider entitlement not selected';
 end if;
end; $$;
reset role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
update public.portal_subscriptions set current_period_end=now()-interval '1 day' where user_id='00000000-0000-4000-8000-000000000051';
update public.portal_provider_subscriptions set status='cancelled',renewals_stopped=true where reference_code='fixture-rls-one';
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000051"}',true);
set local role authenticated;
do $$ begin
 if public.portal_current_paid_access()->>'provider' is distinct from 'iyzico' or public.portal_current_paid_access()->>'cancel_at_period_end' is distinct from 'true' then
  raise exception 'Cancelled but paid iyzico access lost after Stripe expiry';
 end if;
 if public.portal_has_paid_access('00000000-0000-4000-8000-000000000051') is distinct from true then raise exception 'Paid access predicate disagrees with current RPC'; end if;
end; $$;
reset role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
update public.portal_provider_subscriptions set revoked_at=now() where reference_code='fixture-rls-one';
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000051"}',true);
set local role authenticated;
do $$ begin
 if public.portal_current_paid_access() is not null then raise exception 'Expired/revoked cross-provider access survived'; end if;
 if public.portal_has_paid_access('00000000-0000-4000-8000-000000000051') is distinct from false then raise exception 'Expired/revoked paid predicate survived'; end if;
end; $$;
reset role;
select set_config('request.jwt.claims','{"role":"anon"}',true);
set local role anon;
do $$ begin
 begin
  perform public.portal_current_paid_access();
  raise exception 'Anonymous current-paid-access execution allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform public.portal_iyzico_schema_ready();
  raise exception 'Anonymous schema administration execution allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform 1 from public.portal_provider_subscriptions;
  raise exception 'Anonymous subscription read allowed';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
rollback;
