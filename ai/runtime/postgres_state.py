from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone

import psycopg

POSTGRES_DSN = os.getenv("CLINIGA_POSTGRES_DSN", "postgresql://cliniga:cliniga@localhost:5432/cliniga")

SCHEMA = """
CREATE TABLE IF NOT EXISTS ai_audit_log (
  id UUID PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL,
  tenant_id TEXT NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_ai_audit_tenant_ts ON ai_audit_log(tenant_id, ts DESC);

CREATE TABLE IF NOT EXISTS ai_jobs (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  payload JSONB NOT NULL,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_tenant_status ON ai_jobs(tenant_id, status);
"""


def ensure_schema() -> None:
    with psycopg.connect(POSTGRES_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute(SCHEMA)
        conn.commit()


def audit(tenant_id: str, actor: str, action: str, resource: str, metadata: dict | None = None) -> str:
    event_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    with psycopg.connect(POSTGRES_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO ai_audit_log(id,ts,tenant_id,actor,action,resource,metadata) VALUES (%s,%s,%s,%s,%s,%s,%s::jsonb)",
                (event_id, now, tenant_id, actor, action, resource, json.dumps(metadata or {})),
            )
        conn.commit()
    return event_id


def create_job(tenant_id: str, kind: str, payload: dict) -> str:
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    with psycopg.connect(POSTGRES_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO ai_jobs(id,tenant_id,kind,status,payload,created_at,updated_at) VALUES (%s,%s,%s,'queued',%s::jsonb,%s,%s)",
                (job_id, tenant_id, kind, json.dumps(payload), now, now),
            )
        conn.commit()
    return job_id
