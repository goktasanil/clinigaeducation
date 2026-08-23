-- Route portal edits through validated server functions. Browser roles retain
-- row-scoped reads/inserts/deletes, but cannot issue direct UPDATE statements.
begin;

drop policy if exists "portal_profiles_update_own" on public.portal_profiles;
revoke all privileges on table public.portal_profiles from authenticated;
grant select, insert on table public.portal_profiles to authenticated;

drop policy if exists "portal_listings_update_own" on public.portal_listings;
revoke all privileges on table public.portal_listings from authenticated;
grant select, delete on table public.portal_listings to authenticated;

do $$
begin
  if has_table_privilege('authenticated', 'public.portal_profiles', 'UPDATE')
    or has_any_column_privilege('authenticated', 'public.portal_profiles', 'UPDATE') then
    raise exception 'authenticated still has direct portal_profiles UPDATE access';
  end if;

  if has_table_privilege('authenticated', 'public.portal_listings', 'UPDATE')
    or has_any_column_privilege('authenticated', 'public.portal_listings', 'UPDATE') then
    raise exception 'authenticated still has direct portal_listings UPDATE access';
  end if;
end;
$$;

commit;

