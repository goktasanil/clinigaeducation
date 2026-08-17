
CREATE TABLE public.alert_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  period TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'all',
  current_count INTEGER NOT NULL,
  previous_count INTEGER NOT NULL,
  change_pct NUMERIC,
  threshold_pct NUMERIC NOT NULL,
  min_lead INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  note TEXT,
  alert_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT alert_history_status_chk CHECK (status IN ('new','read','handled')),
  CONSTRAINT alert_history_unique UNIQUE (user_id, intent, period, scope, alert_date)
);

CREATE INDEX alert_history_user_created_idx
  ON public.alert_history (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.alert_history TO authenticated;
GRANT ALL ON public.alert_history TO service_role;

ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own alerts"
  ON public.alert_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own alerts"
  ON public.alert_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own alerts"
  ON public.alert_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER alert_history_set_updated_at
  BEFORE UPDATE ON public.alert_history
  FOR EACH ROW EXECUTE FUNCTION public.set_saved_filters_updated_at();
