from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone

import psycopg

POSTGRES_DSN = os.getenv("CLINIGA_POSTGRES_DSN", "postgresql://cliniga:cliniga@localhost:5432/cliniga")

SCHEMA = """
CREATE TABLE IF NOT EXISTS ai_audit_log (
  id UUID PRIMARY KEY, ts TIMESTAMPTZ NOT NULL, tenant_id TEXT NOT NULL,
  actor TEXT NOT NULL, action TEXT NOT NULL, resource TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_ai_audit_tenant_ts ON ai_audit_log(tenant_id, ts DESC);
CREATE TABLE IF NOT EXISTS ai_jobs (
  id UUID PRIMARY KEY, tenant_id TEXT NOT NULL, kind TEXT NOT NULL,
  status TEXT NOT NULL, payload JSONB NOT NULL, result JSONB, error TEXT,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_tenant_status ON ai_jobs(tenant_id, status, created_at DESC);
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
            cur.execute("INSERT INTO ai_audit_log(id,ts,tenant_id,actor,action,resource,metadata) VALUES (%s,%s,%s,%s,%s,%s,%s::jsonb)", (event_id, now, tenant_id, actor, action, resource, json.dumps(metadata or {})))
        conn.commit()
    return event_id


def create_job(tenant_id: str, kind: str, payload: dict) -> str:
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    with psycopg.connect(POSTGRES_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO ai_jobs(id,tenant_id,kind,status,payload,created_at,updated_at) VALUES (%s,%s,%s,'queued',%s::jsonb,%s,%s)", (job_id, tenant_id, kind, json.dumps(payload), now, now))
        conn.commit()
    return job_id


def update_job(job_id: str, tenant_id: str, *, status: str, result: dict | None = None, error: str | None = None) -> None:
    now = datetime.now(timezone.utc)
    with psycopg.connect(POSTGRES_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE ai_jobs SET status=%s,result=%s::jsonb,error=%s,updated_at=%s WHERE id=%s AND tenant_id=%s", (status, json.dumps(result) if result is not None else None, error, now, job_id, tenant_id))
            if cur.rowcount != 1:
                raise KeyError("job not found")
        conn.commit()


def get_job(job_id: str, tenant_id: str) -> dict | None:
    with psycopg.connect(POSTGRES_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id,kind,status,payload,result,error,created_at,updated_at FROM ai_jobs WHERE id=%s AND tenant_id=%s", (job_id, tenant_id))
            row = cur.fetchone()
    if not row:
        return None
    return {"id": str(row[0]), "kind": row[1], "status": row[2], "payload": row[3], "result": row[4], "error": row[5], "created_at": row[6].isoformat(), "updated_at": row[7].isoformat()}


def list_audit(tenant_id: str, limit: int = 100) -> list[dict]:
    limit = min(max(1, limit), 500)
    with psycopg.connect(POSTGRES_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id,ts,actor,action,resource,metadata FROM ai_audit_log WHERE tenant_id=%s ORDER BY ts DESC LIMIT %s", (tenant_id, limit))
            rows = cur.fetchall()
    return [{"id": str(r[0]), "ts": r[1].isoformat(), "actor": r[2], "action": r[3], "resource": r[4], "metadata": r[5]} for r in rows]
