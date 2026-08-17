CREATE TABLE public.sanitize_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fired_at timestamp with time zone NOT NULL DEFAULT now(),
  dangerous_count integer NOT NULL DEFAULT 0,
  threshold integer NOT NULL DEFAULT 0,
  window_minutes integer NOT NULL DEFAULT 0,
  first_event_at timestamp with time zone,
  last_event_at timestamp with time zone,
  audit_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  counts_by_audit_id jsonb NOT NULL DEFAULT '[]'::jsonb,
  counts_by_source jsonb NOT NULL DEFAULT '[]'::jsonb,
  samples jsonb NOT NULL DEFAULT '[]'::jsonb,
  slack_status text NOT NULL DEFAULT 'not_configured',
  slack_error text,
  email_status text NOT NULL DEFAULT 'not_configured',
  email_error text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sanitize_alerts TO authenticated;
GRANT ALL ON public.sanitize_alerts TO service_role;

ALTER TABLE public.sanitize_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sanitize alerts"
ON public.sanitize_alerts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX sanitize_alerts_fired_at_idx ON public.sanitize_alerts (fired_at DESC);

CREATE TRIGGER sanitize_alerts_set_updated_at
BEFORE UPDATE ON public.sanitize_alerts
FOR EACH ROW EXECUTE FUNCTION public.set_saved_filters_updated_at();