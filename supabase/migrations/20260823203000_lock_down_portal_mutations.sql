-- Narrow portal mutation privileges so trust, payment and moderation state can
-- only be changed by service-role workflows. RLS still limits rows by owner.
begin;

revoke update on table public.portal_profiles from authenticated;
grant update (
  display_name,
  country_code,
  city,
  institution,
  program,
  locale,
  onboarding_completed
) on table public.portal_profiles to authenticated;

revoke update on table public.portal_listings from authenticated;
grant update (
  kind,
  title,
  description,
  country_code,
  city,
  institution,
  program,
  price_amount,
  currency
) on table public.portal_listings to authenticated;

-- Postgres grants EXECUTE on new functions broadly by default. Keep the
-- authenticated paid-listing RPC available, but remove anonymous access and
-- retire the legacy RPC from client roles. Stripe credit grants remain
-- service-role only.
revoke execute on function public.portal_create_paid_listing_v2(
  text, text, text, text, text, text, text, numeric, text, text
) from public, anon;
grant execute on function public.portal_create_paid_listing_v2(
  text, text, text, text, text, text, text, numeric, text, text
) to authenticated;

revoke execute on function public.portal_create_paid_listing(
  text, text, text, text, text, text, text, text
) from public, anon, authenticated;

revoke execute on function public.portal_grant_stripe_credits(
  uuid, integer, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.portal_grant_stripe_credits(
  uuid, integer, text, text, jsonb
) to service_role;

do $$
begin
  if has_column_privilege('authenticated', 'public.portal_profiles', 'account_role', 'UPDATE')
    or has_column_privilege('authenticated', 'public.portal_profiles', 'verification_status', 'UPDATE')
    or has_column_privilege('authenticated', 'public.portal_profiles', 'verification_reviewed_at', 'UPDATE')
    or has_column_privilege('authenticated', 'public.portal_profiles', 'suspended_at', 'UPDATE') then
    raise exception 'portal_profiles protected columns remain user-writable';
  end if;

  if has_column_privilege('authenticated', 'public.portal_listings', 'verified', 'UPDATE')
    or has_column_privilege('authenticated', 'public.portal_listings', 'status', 'UPDATE')
    or has_column_privilege('authenticated', 'public.portal_listings', 'payment_state', 'UPDATE')
    or has_column_privilege('authenticated', 'public.portal_listings', 'credit_cost', 'UPDATE')
    or has_column_privilege('authenticated', 'public.portal_listings', 'owner_id', 'UPDATE') then
    raise exception 'portal_listings protected columns remain user-writable';
  end if;

  if has_function_privilege(
    'anon',
    'public.portal_grant_stripe_credits(uuid,integer,text,text,jsonb)',
    'EXECUTE'
  ) then
    raise exception 'anonymous Stripe credit grant execution remains enabled';
  end if;
end;
$$;

commit;

