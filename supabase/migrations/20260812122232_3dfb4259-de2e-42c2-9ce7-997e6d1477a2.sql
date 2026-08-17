CREATE TABLE public.sanitize_audit_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id text,
  source text NOT NULL,
  post_id text,
  lang text,
  dangerous boolean NOT NULL DEFAULT false,
  altered boolean NOT NULL DEFAULT false,
  input_length integer NOT NULL DEFAULT 0,
  output_length integer NOT NULL DEFAULT 0,
  blocked_urls integer NOT NULL DEFAULT 0,
  removed_comments integer NOT NULL DEFAULT 0,
  auto_closed_tags integer NOT NULL DEFAULT 0,
  removed_dangerous_elements jsonb NOT NULL DEFAULT '{}'::jsonb,
  removed_tags jsonb NOT NULL DEFAULT '{}'::jsonb,
  removed_attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sanitize_audit_events TO authenticated;
GRANT ALL ON public.sanitize_audit_events TO service_role;

ALTER TABLE public.sanitize_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sanitize audit events"
  ON public.sanitize_audit_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX sanitize_audit_events_created_at_idx
  ON public.sanitize_audit_events (created_at DESC);
CREATE INDEX sanitize_audit_events_dangerous_idx
  ON public.sanitize_audit_events (dangerous, created_at DESC);