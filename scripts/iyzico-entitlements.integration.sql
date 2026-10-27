-- Run ONLY against a disposable local Supabase database with all migrations applied.
-- Example: psql "$LOCAL_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/iyzico-entitlements.integration.sql
-- Synthetic fixtures are transactionally rolled back. No production execution.
begin;
insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000027','iyzico-fixture@example.invalid');
select set_config('request.jwt.claims','{"role":"service_role"}',true);
insert into public.portal_iyzico_checkouts(id,user_id,request_id,provider_mode,kind,product_key,currency,amount_minor,credits,status)
values('00000000-0000-4000-8000-000000000028','00000000-0000-4000-8000-000000000027','00000000-0000-4000-8000-000000000029','live','credits','credits-25','EUR',999,25,'ready');
select public.portal_iyzico_apply_credit_payment('00000000-0000-4000-8000-000000000028','fixture-payment');
select public.portal_iyzico_apply_credit_payment('00000000-0000-4000-8000-000000000028','fixture-payment');
do $$ begin
 if(select balance from public.portal_credit_wallets where user_id='00000000-0000-4000-8000-000000000027')<>25 then raise exception 'duplicate payment changed wallet'; end if;
 if(select count(*) from public.portal_credit_transactions where payment_provider='iyzico' and provider_event_id='payment:fixture-payment')<>1 then raise exception 'duplicate payment ledger'; end if;
 if has_function_privilege('anon','public.portal_grant_iyzico_credits(uuid,integer,text,text)','EXECUTE')
 or has_function_privilege('authenticated','public.portal_grant_iyzico_credits(uuid,integer,text,text)','EXECUTE') then raise exception 'unprivileged entitlement grant'; end if;
end; $$;
insert into public.portal_iyzico_checkouts(id,user_id,request_id,provider_mode,kind,product_key,currency,amount_minor,credits,status,plan_reference)
values('00000000-0000-4000-8000-000000000030','00000000-0000-4000-8000-000000000027','00000000-0000-4000-8000-000000000031','live','membership','basic','EUR',499,10,'ready','fixture-plan');
select public.portal_iyzico_register_subscription('00000000-0000-4000-8000-000000000030','fixture-subscription','fixture-customer','active');
select public.portal_iyzico_record_period(id,'fixture-period',now()-interval '1 minute',now()+interval '28 days') from public.portal_provider_subscriptions where reference_code='fixture-subscription';
select public.portal_iyzico_record_period(id,'fixture-period',now()-interval '1 minute',now()+interval '28 days') from public.portal_provider_subscriptions where reference_code='fixture-subscription';
do $$ begin
 if(select balance from public.portal_credit_wallets where user_id='00000000-0000-4000-8000-000000000027')<>35 then raise exception 'period was credited twice'; end if;
 if not public.portal_has_paid_access('00000000-0000-4000-8000-000000000027') then raise exception 'paid access missing'; end if;
end; $$;
update public.portal_provider_subscriptions set status='cancelled',renewals_stopped=true where reference_code='fixture-subscription';
do $$ begin
 if not public.portal_has_paid_access('00000000-0000-4000-8000-000000000027') then raise exception 'cancellation removed paid time'; end if;
end; $$;
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000099"}',true);
do $$ begin
 if public.portal_has_paid_access('00000000-0000-4000-8000-000000000027') then raise exception 'other-user entitlement leaked'; end if;
end; $$;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
update public.portal_provider_subscriptions set revoked_at=now() where reference_code='fixture-subscription';
do $$ begin
 if public.portal_has_paid_access('00000000-0000-4000-8000-000000000027') then raise exception 'revoked access survived'; end if;
end; $$;
-- Two different users must be able to debit listings with NULL provider identifiers.
select set_config('request.jwt.claims','{"role":"service_role"}',true);
insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000040','iyzico-second-fixture@example.invalid');
insert into public.portal_profiles(user_id,verification_status) values
 ('00000000-0000-4000-8000-000000000027','verified'),
 ('00000000-0000-4000-8000-000000000040','verified')
on conflict(user_id) do update set verification_status='verified';
-- Restore the first user's paid access after testing explicit revocation.
update public.portal_provider_subscriptions set revoked_at=null where reference_code='fixture-subscription';
insert into public.portal_subscriptions(user_id,plan,status,current_period_end)
 values('00000000-0000-4000-8000-000000000040','basic','active',now()+interval '28 days');
insert into public.portal_iyzico_checkouts(id,user_id,request_id,provider_mode,kind,product_key,currency,amount_minor,credits,status)
 values('00000000-0000-4000-8000-000000000041','00000000-0000-4000-8000-000000000040','00000000-0000-4000-8000-000000000042','live','credits','credits-25','EUR',999,25,'ready');
select public.portal_iyzico_apply_credit_payment('00000000-0000-4000-8000-000000000041','second-fixture-payment');
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000027"}',true);
select public.portal_create_paid_listing_v2('marketplace','Synthetic fixture one','Disposable database fixture only','TR','Istanbul',null,null,null,'EUR','fixture-listing-one');
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000040"}',true);
select public.portal_create_paid_listing_v2('marketplace','Synthetic fixture two','Disposable database fixture only','TR','Istanbul',null,null,null,'EUR','fixture-listing-two');
do $$ begin
 if(select count(*) from public.portal_credit_transactions where idempotency_key in('fixture-listing-one','fixture-listing-two') and direction='debit' and payment_provider is null and provider_event_id is null)<>2 then raise exception 'second listing debit was blocked'; end if;
 if(select balance from public.portal_credit_wallets where user_id='00000000-0000-4000-8000-000000000027')<>30 then raise exception 'first listing wallet mismatch'; end if;
 if(select balance from public.portal_credit_wallets where user_id='00000000-0000-4000-8000-000000000040')<>20 then raise exception 'second listing wallet mismatch'; end if;
end; $$;
-- A deployed checkout row cannot represent sandbox money.
do $$ begin
 begin
  insert into public.portal_iyzico_checkouts(user_id,request_id,provider_mode,kind,product_key,currency,amount_minor,credits)
  values('00000000-0000-4000-8000-000000000040','00000000-0000-4000-8000-000000000043','sandbox','credits','credits-25','EUR',999,25);
  raise exception 'sandbox checkout row accepted';
 exception when check_violation then null;
 end;
end; $$;
rollback;
