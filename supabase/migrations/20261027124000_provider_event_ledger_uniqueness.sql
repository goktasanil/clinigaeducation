-- Provider events are unique only when both identifiers are present.
-- Listing debits intentionally have no provider/payment identifiers.
begin;
do $$
declare v_name text; v_provider smallint; v_event smallint;
begin
 select attnum into v_provider from pg_attribute where attrelid='public.portal_credit_transactions'::regclass and attname='payment_provider';
 select attnum into v_event from pg_attribute where attrelid='public.portal_credit_transactions'::regclass and attname='provider_event_id';
 for v_name in select conname from pg_constraint
  where conrelid='public.portal_credit_transactions'::regclass and contype='u'
  and conkey=array[v_provider,v_event]::smallint[]
 loop
  execute format('alter table public.portal_credit_transactions drop constraint %I',v_name);
 end loop;
end; $$;
create unique index portal_credit_transactions_provider_event_present_unique
 on public.portal_credit_transactions(payment_provider,provider_event_id)
 where payment_provider is not null and provider_event_id is not null;
-- Existing unique(user_id,idempotency_key) is deliberately unchanged.
create or replace function public.portal_iyzico_schema_ready() returns integer language sql security definer set search_path=public as $$ select 20261028; $$;
revoke all on function public.portal_iyzico_schema_ready() from public,anon,authenticated;
grant execute on function public.portal_iyzico_schema_ready() to service_role;
commit;
