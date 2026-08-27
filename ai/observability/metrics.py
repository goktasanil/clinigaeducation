from __future__ import annotations

import hashlib
from prometheus_client import Counter, Gauge, Histogram

REQUESTS = Counter("cliniga_ai_requests_total", "AI API requests", ["endpoint", "status"])
LATENCY = Histogram("cliniga_ai_request_latency_seconds", "AI API request latency", ["endpoint"])
INFLIGHT = Gauge("cliniga_ai_inflight_requests", "In-flight AI requests", ["endpoint"])
RETRIEVAL_HITS = Counter("cliniga_ai_retrieval_hits_total", "Retrieved chunks", ["tenant"])
INGESTED_CHUNKS = Counter("cliniga_ai_ingested_chunks_total", "Ingested chunks", ["tenant"])
OBJECT_UPLOADS = Counter("cliniga_ai_object_uploads_total", "Objects uploaded for ingestion", ["tenant"])
JOBS = Counter("cliniga_ai_jobs_total", "Asynchronous jobs created", ["tenant", "kind"])
RATE_LIMITED = Counter("cliniga_ai_rate_limited_total", "Requests rejected by distributed rate limiting", ["tenant"])


def tenant_label(tenant_id: str) -> str:
    return hashlib.sha256(tenant_id.encode()).hexdigest()[:12]
