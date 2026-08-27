from __future__ import annotations

from prometheus_client import Counter, Histogram, Gauge

REQUESTS = Counter("cliniga_ai_requests_total", "AI API requests", ["endpoint", "status"])
LATENCY = Histogram("cliniga_ai_request_latency_seconds", "AI API request latency", ["endpoint"])
INFLIGHT = Gauge("cliniga_ai_inflight_requests", "In-flight AI requests", ["endpoint"])
RETRIEVAL_HITS = Counter("cliniga_ai_retrieval_hits_total", "Retrieved chunks", ["tenant"])
INGESTED_CHUNKS = Counter("cliniga_ai_ingested_chunks_total", "Ingested chunks", ["tenant"])
