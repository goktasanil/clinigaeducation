CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_created
  ON audit_log (tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS job_state (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_state_tenant_status
  ON job_state (tenant_id, status);
