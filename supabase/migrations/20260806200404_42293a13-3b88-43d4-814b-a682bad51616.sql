CREATE TABLE public.gsc_url_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  verdict TEXT,
  coverage_state TEXT,
  robots_txt_state TEXT,
  indexing_state TEXT,
  page_fetch_state TEXT,
  last_crawl_time TIMESTAMPTZ,
  google_canonical TEXT,
  user_canonical TEXT,
  error_message TEXT,
  raw JSONB,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gsc_url_snapshots_url_checked ON public.gsc_url_snapshots (url, checked_at DESC);
CREATE INDEX idx_gsc_url_snapshots_checked ON public.gsc_url_snapshots (checked_at DESC);

GRANT SELECT ON public.gsc_url_snapshots TO authenticated;
GRANT ALL ON public.gsc_url_snapshots TO service_role;
ALTER TABLE public.gsc_url_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view url snapshots"
ON public.gsc_url_snapshots FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.gsc_perf_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC NOT NULL DEFAULT 0,
  average_position NUMERIC NOT NULL DEFAULT 0,
  range_start DATE,
  range_end DATE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gsc_perf_snapshots_captured ON public.gsc_perf_snapshots (captured_at DESC);

GRANT SELECT ON public.gsc_perf_snapshots TO authenticated;
GRANT ALL ON public.gsc_perf_snapshots TO service_role;
ALTER TABLE public.gsc_perf_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view perf snapshots"
ON public.gsc_perf_snapshots FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));