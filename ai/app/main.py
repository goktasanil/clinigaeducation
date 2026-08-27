import hashlib
import os
import time

from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.responses import Response
from peft import PeftModel
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from pydantic import BaseModel, Field
from transformers import AutoModelForCausalLM, AutoTokenizer

from ai.ingestion.pipeline import ingest_documents
from ai.observability.metrics import INFLIGHT, INGESTED_CHUNKS, JOBS, LATENCY, OBJECT_UPLOADS, RATE_LIMITED, REQUESTS, RETRIEVAL_HITS, tenant_label
from ai.observability.otel import instrument_app
from ai.rag.query_pipeline import retrieve
from ai.runtime.agent_runtime import AgentRuntime
from ai.runtime.controls import SlidingWindowRateLimiter, TTLCache
from ai.runtime.distributed_cache import RedisCache, RedisRateLimiter
from ai.runtime.jobs import process_ingest_object_job
from ai.runtime.postgres_state import audit, create_job, ensure_schema, get_job, list_audit, update_job
from ai.runtime.task_queue import enqueue
from ai.security.rbac import Principal, require
from ai.security.tenant_auth import TenantContext, authenticate
from ai.skills import registry
from ai.storage.object_store import ObjectStore

MODEL_NAME = os.getenv("CLINIGA_MODEL", "Qwen/Qwen3-8B")
MODEL_REVISION = os.getenv("CLINIGA_MODEL_REVISION", "").strip()
ADAPTER_PATH = os.getenv("CLINIGA_ADAPTER", "")
MAX_INPUT_CHARS = int(os.getenv("CLINIGA_MAX_INPUT_CHARS", "30000"))
MAX_UPLOAD_BYTES = int(os.getenv("CLINIGA_MAX_UPLOAD_BYTES", str(25 * 1024 * 1024)))
CACHE_TTL_SECONDS = int(os.getenv("CLINIGA_CACHE_TTL_SECONDS", "300"))
RATE_LIMIT = int(os.getenv("CLINIGA_RATE_LIMIT", "120"))
RATE_WINDOW_SECONDS = int(os.getenv("CLINIGA_RATE_WINDOW_SECONDS", "60"))
DISTRIBUTED_CONTROLS = os.getenv("CLINIGA_DISTRIBUTED_CONTROLS", "true").lower() == "true"
ALLOW_LOCAL_FALLBACK = os.getenv("CLINIGA_ALLOW_LOCAL_FALLBACK", "false").lower() == "true"
STATE_ENABLED = os.getenv("CLINIGA_STATE_ENABLED", "true").lower() == "true"
AUDIT_FAIL_CLOSED = os.getenv("CLINIGA_AUDIT_FAIL_CLOSED", "true").lower() == "true"

app = FastAPI(title="CliniGA AI Engine", version="0.4.0")
instrument_app(app)
_tokenizer = None
_model = None
_agent_runtime = AgentRuntime.create()
_local_cache = TTLCache(ttl_seconds=CACHE_TTL_SECONDS, max_items=4096)
_local_rate_limiter = SlidingWindowRateLimiter(limit=RATE_LIMIT, window_seconds=RATE_WINDOW_SECONDS)
_redis_cache = RedisCache()
_redis_rate_limiter = RedisRateLimiter(limit=RATE_LIMIT, window_seconds=RATE_WINDOW_SECONDS)


def get_model():
    global _tokenizer, _model
    if _model is None:
        if not MODEL_REVISION:
            raise RuntimeError("CLINIGA_MODEL_REVISION must pin an immutable Hugging Face model revision")
        _tokenizer = AutoTokenizer.from_pretrained(
            MODEL_NAME,
            revision=MODEL_REVISION,
            trust_remote_code=False,
        )
        _model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            revision=MODEL_REVISION,
            device_map="auto",
            torch_dtype="auto",
            trust_remote_code=False,
        )
        if ADAPTER_PATH and os.path.isdir(ADAPTER_PATH):
            _model = PeftModel.from_pretrained(_model, ADAPTER_PATH)
    return _tokenizer, _model


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=MAX_INPUT_CHARS)
    system: str = "You are CliniGA AI. Be accurate, source-aware, and transparent about uncertainty."
    max_new_tokens: int = Field(default=768, ge=16, le=4096)


class AgentRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=200)
    task: str = Field(min_length=1, max_length=MAX_INPUT_CHARS)


class Document(BaseModel):
    source: str = Field(default="inline", max_length=500)
    text: str = Field(min_length=1, max_length=200000)


class IngestRequest(BaseModel):
    documents: list[Document] = Field(min_length=1, max_length=50)


class AsyncIngestRequest(BaseModel):
    object_key: str = Field(min_length=3, max_length=1200)


class RetrieveRequest(BaseModel):
    query: str = Field(min_length=1, max_length=5000)
    limit: int = Field(default=8, ge=1, le=20)


def _principal(ctx: TenantContext) -> Principal:
    return Principal(ctx.tenant_id, ctx.subject, ctx.role)


def _emit_audit(ctx: TenantContext, action: str, resource: str, metadata: dict | None = None, *, fail_closed: bool | None = None) -> None:
    if not STATE_ENABLED:
        return
    should_fail_closed = AUDIT_FAIL_CLOSED if fail_closed is None else fail_closed
    try:
        audit(ctx.tenant_id, ctx.subject, action, resource, metadata)
    except Exception as exc:
        if should_fail_closed:
            raise HTTPException(status_code=503, detail="Audit persistence unavailable") from exc


def _authorize(ctx: TenantContext, permission: str) -> None:
    try:
        require(_principal(ctx), permission)
    except PermissionError as exc:
        _emit_audit(ctx, "rbac.denied", permission, {"role": ctx.role}, fail_closed=False)
        raise HTTPException(status_code=403, detail=str(exc)) from exc


def _cache_get(ctx: TenantContext, key: str):
    if DISTRIBUTED_CONTROLS:
        try:
            return _redis_cache.get(ctx.tenant_id, key)
        except Exception as exc:
            if not ALLOW_LOCAL_FALLBACK:
                raise HTTPException(status_code=503, detail="Distributed cache unavailable") from exc
    return _local_cache.get(f"{ctx.tenant_id}:{key}")


def _cache_set(ctx: TenantContext, key: str, value) -> None:
    if DISTRIBUTED_CONTROLS:
        try:
            _redis_cache.set(ctx.tenant_id, key, value, ttl_seconds=CACHE_TTL_SECONDS)
            return
        except Exception as exc:
            if not ALLOW_LOCAL_FALLBACK:
                raise HTTPException(status_code=503, detail="Distributed cache unavailable") from exc
    _local_cache.set(f"{ctx.tenant_id}:{key}", value)


def _allow_request(tenant_id: str) -> bool:
    if DISTRIBUTED_CONTROLS:
        try:
            return _redis_rate_limiter.allow(tenant_id)
        except Exception as exc:
            if not ALLOW_LOCAL_FALLBACK:
                raise HTTPException(status_code=503, detail="Distributed rate limiter unavailable") from exc
    return _local_rate_limiter.allow(tenant_id)


def tenant_context(x_tenant_id: str = Header(..., alias="X-Tenant-ID"), x_api_key: str = Header(..., alias="X-API-Key")) -> TenantContext:
    try:
        ctx = authenticate(x_tenant_id, x_api_key)
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    if not _allow_request(ctx.tenant_id):
        RATE_LIMITED.labels(tenant_label(ctx.tenant_id)).inc()
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    return ctx


@app.on_event("startup")
def startup() -> None:
    if STATE_ENABLED:
        ensure_schema()


@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    endpoint = request.url.path
    start = time.perf_counter()
    INFLIGHT.labels(endpoint).inc()
    status = "500"
    try:
        response = await call_next(request)
        status = str(response.status_code)
        return response
    finally:
        INFLIGHT.labels(endpoint).dec()
        REQUESTS.labels(endpoint, status).inc()
        LATENCY.labels(endpoint).observe(time.perf_counter() - start)


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME, "version": app.version, "dependencies": {"distributed_controls": DISTRIBUTED_CONTROLS, "state": STATE_ENABLED}}


@app.get("/skills")
def skills():
    return {"skills": registry.list()}


@app.get("/metrics")
def metrics_endpoint(ctx: TenantContext = Depends(tenant_context)):
    _authorize(ctx, "metrics.read")
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/audit")
def audit_endpoint(limit: int = 100, ctx: TenantContext = Depends(tenant_context)):
    _authorize(ctx, "audit.read")
    if not STATE_ENABLED:
        raise HTTPException(status_code=503, detail="Persistent state is disabled")
    return {"tenant_id": ctx.tenant_id, "events": list_audit(ctx.tenant_id, limit=limit)}


@app.post("/objects")
async def upload_object(file: UploadFile = File(...), ctx: TenantContext = Depends(tenant_context)):
    _authorize(ctx, "ingest.write")
    payload = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(payload) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Upload exceeds configured maximum size")
    key = ObjectStore().upload_bytes(ctx.tenant_id, file.filename or "document.bin", payload, file.content_type)
    OBJECT_UPLOADS.labels(tenant_label(ctx.tenant_id)).inc()
    _emit_audit(ctx, "object.uploaded", key, {"bytes": len(payload)})
    return {"tenant_id": ctx.tenant_id, "object_key": key, "bytes": len(payload)}


@app.post("/ingest")
def ingest(req: IngestRequest, ctx: TenantContext = Depends(tenant_context)):
    _authorize(ctx, "ingest.write")
    count = ingest_documents([doc.model_dump() for doc in req.documents], tenant_id=ctx.tenant_id)
    INGESTED_CHUNKS.labels(tenant_label(ctx.tenant_id)).inc(count)
    _emit_audit(ctx, "ingest.inline", "knowledge", {"chunks_ingested": count})
    return {"tenant_id": ctx.tenant_id, "chunks_ingested": count}


@app.post("/ingest/async")
def ingest_async(req: AsyncIngestRequest, ctx: TenantContext = Depends(tenant_context)):
    _authorize(ctx, "ingest.write")
    if not STATE_ENABLED:
        raise HTTPException(status_code=503, detail="Persistent state is disabled")
    if not req.object_key.startswith(f"{ctx.tenant_id}/"):
        raise HTTPException(status_code=403, detail="Cross-tenant object access denied")
    job_id = create_job(ctx.tenant_id, "ingest_object", {"object_key": req.object_key, "actor": ctx.subject})
    try:
        enqueue(process_ingest_object_job, job_id, ctx.tenant_id, ctx.subject, req.object_key)
    except Exception as exc:
        update_job(job_id, ctx.tenant_id, status="failed", error=f"queue unavailable: {type(exc).__name__}")
        raise HTTPException(status_code=503, detail="Job queue unavailable") from exc
    JOBS.labels(tenant_label(ctx.tenant_id), "ingest_object").inc()
    _emit_audit(ctx, "ingest.async.queued", req.object_key, {"job_id": job_id})
    return {"tenant_id": ctx.tenant_id, "job_id": job_id, "status": "queued"}


@app.get("/jobs/{job_id}")
def job_status(job_id: str, ctx: TenantContext = Depends(tenant_context)):
    _authorize(ctx, "retrieve.read")
    if not STATE_ENABLED:
        raise HTTPException(status_code=503, detail="Persistent state is disabled")
    job = get_job(job_id, ctx.tenant_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"tenant_id": ctx.tenant_id, "job": job}


@app.post("/retrieve")
def retrieve_endpoint(req: RetrieveRequest, ctx: TenantContext = Depends(tenant_context)):
    _authorize(ctx, "retrieve.read")
    key = hashlib.sha256(f"{req.query}:{req.limit}".encode()).hexdigest()
    cached = _cache_get(ctx, key)
    if cached is not None:
        return cached
    rows, citations = retrieve(req.query, tenant_id=ctx.tenant_id, limit=req.limit)
    payload = {"tenant_id": ctx.tenant_id, "results": rows, "citations": [c.__dict__ for c in citations]}
    _cache_set(ctx, key, payload)
    RETRIEVAL_HITS.labels(tenant_label(ctx.tenant_id)).inc(len(rows))
    return payload


@app.post("/agent")
async def agent(req: AgentRequest, ctx: TenantContext = Depends(tenant_context)):
    _authorize(ctx, "agent.read")
    try:
        result = await _agent_runtime.answer(f"{ctx.tenant_id}:{req.user_id}", req.task)
        _emit_audit(ctx, "agent.completed", f"user:{req.user_id}", {"task_chars": len(req.task)}, fail_closed=False)
        return result
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Agent runtime failed") from exc


@app.post("/chat")
def chat(req: ChatRequest, ctx: TenantContext = Depends(tenant_context)):
    _authorize(ctx, "agent.read")
    tokenizer, model = get_model()
    messages = [{"role": "system", "content": req.system}, {"role": "user", "content": req.message}]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    try:
        output = model.generate(**inputs, max_new_tokens=req.max_new_tokens, do_sample=True, temperature=0.2, top_p=0.9)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Model generation failed") from exc
    answer = tokenizer.decode(output[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
    _emit_audit(ctx, "chat.completed", "model", {"input_chars": len(req.message), "output_chars": len(answer)}, fail_closed=False)
    return {"answer": answer, "model": MODEL_NAME, "tenant_id": ctx.tenant_id}
