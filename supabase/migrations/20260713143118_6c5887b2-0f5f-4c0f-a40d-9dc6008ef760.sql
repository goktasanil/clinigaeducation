
-- Inline admin check into leads RLS so we no longer expose has_role() as an executable API
DROP POLICY IF EXISTS "Admins can read leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;

CREATE POLICY "Admins can read leads" ON public.leads
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Revoke EXECUTE on all SECURITY DEFINER helpers from anon/authenticated/public.
-- has_role and get_booked_slots will now only be callable by the service role from server code.
-- grant_admin_for_known_emails is a trigger and should never be RPC-callable.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_booked_slots() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_admin_for_known_emails() FROM PUBLIC, anon, authenticated;
