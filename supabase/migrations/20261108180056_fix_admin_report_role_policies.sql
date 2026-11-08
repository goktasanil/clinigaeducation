-- Later admin-report policies still called has_role after client execution of
-- that helper was revoked. Reuse the own-role predicate already used by leads.
-- Keep has_role, its service/owner semantics, all grants, and booked slots intact.

alter policy "Admins can view url snapshots" on public.gsc_url_snapshots
using (exists (
  select 1 from public.user_roles
  where user_id = auth.uid() and role = 'admin'::public.app_role
));

alter policy "Admins can view perf snapshots" on public.gsc_perf_snapshots
using (exists (
  select 1 from public.user_roles
  where user_id = auth.uid() and role = 'admin'::public.app_role
));

alter policy "Admins can view sanitize audit events" on public.sanitize_audit_events
using (exists (
  select 1 from public.user_roles
  where user_id = auth.uid() and role = 'admin'::public.app_role
));

alter policy "Admins can view sanitize alerts" on public.sanitize_alerts
using (exists (
  select 1 from public.user_roles
  where user_id = auth.uid() and role = 'admin'::public.app_role
));
