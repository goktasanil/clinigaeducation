begin;

-- Public marketplace cards only need listing content. Keep Stripe/payment and
-- idempotency fields on the base table for trusted server-side workflows.
create or replace view public.portal_public_listings
with (security_invoker = true)
as
select
  id,
  kind,
  title,
  description,
  country_code,
  city,
  institution,
  program,
  price_amount,
  currency,
  verified,
  expires_at,
  created_at,
  updated_at,
  global_scope
from public.portal_listings
where status = 'active';

revoke all on table public.portal_public_listings from public, anon, authenticated;

-- A table-level SELECT grant overrides column-level restrictions, so remove it
-- before granting only the columns needed by the security-invoker view.
revoke select on table public.portal_listings from anon, authenticated;
grant select (
  id,
  kind,
  title,
  description,
  country_code,
  city,
  institution,
  program,
  price_amount,
  currency,
  status,
  verified,
  expires_at,
  created_at,
  updated_at,
  global_scope
) on table public.portal_listings to anon, authenticated;

grant select on table public.portal_public_listings to anon, authenticated;

do $$
begin
  if has_column_privilege(
    'anon',
    'public.portal_listings',
    'idempotency_key',
    'SELECT'
  ) or has_column_privilege(
    'anon',
    'public.portal_listings',
    'payment_state',
    'SELECT'
  ) then
    raise exception 'anonymous role can still read internal listing payment fields';
  end if;
end
$$;

commit;

