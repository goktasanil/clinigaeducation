
-- Recreate booked_slots view with security_invoker
DROP VIEW IF EXISTS public.booked_slots;
CREATE VIEW public.booked_slots
WITH (security_invoker = true)
AS
SELECT appointment_at
FROM public.leads
WHERE appointment_at IS NOT NULL
  AND appointment_at >= now()
  AND status <> 'cancelled';

-- Allow anon/auth to read the view rows (the underlying table's SELECT policy blocks them,
-- so we need a dedicated public policy or a security-definer function). Use a definer function instead:
CREATE OR REPLACE FUNCTION public.get_booked_slots()
RETURNS TABLE(appointment_at TIMESTAMPTZ)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT appointment_at FROM public.leads
  WHERE appointment_at IS NOT NULL
    AND appointment_at >= now()
    AND status <> 'cancelled'
$$;

REVOKE ALL ON FUNCTION public.get_booked_slots() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_slots() TO anon, authenticated;

-- Lock down other SECURITY DEFINER functions to only where they're used
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.grant_admin_for_known_emails() FROM PUBLIC;

-- Tighten anon INSERT policy on leads with basic length limits (anti-abuse)
DROP POLICY IF EXISTS "Anyone can create a lead" ON public.leads;
CREATE POLICY "Anyone can create a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 2 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(phone) BETWEEN 5 AND 20
    AND char_length(message) BETWEEN 1 AND 5000
  );
