import hashlib
import os

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

from ai.ingestion.pipeline import ingest_documents
from ai.rag.query_pipeline import retrieve
from ai.runtime.agent_runtime import AgentRuntime
from ai.runtime.controls import cache, metrics, rate_limiter
from ai.security.tenant_auth import TenantContext, authenticate
from ai.skills import registry

MODEL_NAME = os.getenv("CLINIGA_MODEL", "Qwen/Qwen3-8B")
ADAPTER_PATH = os.getenv("CLINIGA_ADAPTER", "")
MAX_INPUT_CHARS = int(os.getenv("CLINIGA_MAX_INPUT_CHARS", "30000"))

app = FastAPI(title="CliniGA AI Engine", version="0.3.0")

_tokenizer = None
_model = None
_agent_runtime = AgentRuntime.create()


def get_model():
    global _tokenizer, _model
    if _model is None:
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=False)
        _model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
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


class RetrieveRequest(BaseModel):
    query: str = Field(min_length=1, max_length=5000)
    limit: int = Field(default=8, ge=1, le=20)


def tenant_context(
    x_tenant_id: str = Header(..., alias="X-Tenant-ID"),
    x_api_key: str = Header(..., alias="X-API-Key"),
) -> TenantContext:
    try:
        ctx = authenticate(x_tenant_id, x_api_key)
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    if not rate_limiter.allow(ctx.tenant_id):
        metrics.inc("rate_limited")
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    return ctx


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME, "version": app.version}


@app.get("/skills")
def skills():
    return {"skills": registry.list()}


@app.get("/metrics")
def metrics_endpoint(ctx: TenantContext = Depends(tenant_context)):
    metrics.inc("metrics_requests")
    return {"tenant_id": ctx.tenant_id, "counters": metrics.snapshot()}


@app.post("/ingest")
def ingest(req: IngestRequest, ctx: TenantContext = Depends(tenant_context)):
    count = ingest_documents([doc.model_dump() for doc in req.documents], tenant_id=ctx.tenant_id)
    metrics.inc("chunks_ingested", count)
    return {"tenant_id": ctx.tenant_id, "chunks_ingested": count}


@app.post("/retrieve")
def retrieve_endpoint(req: RetrieveRequest, ctx: TenantContext = Depends(tenant_context)):
    key = hashlib.sha256(f"{ctx.tenant_id}:{req.query}:{req.limit}".encode()).hexdigest()
    cached = cache.get(key)
    if cached is not None:
        metrics.inc("retrieval_cache_hit")
        return cached
    rows, citations = retrieve(req.query, tenant_id=ctx.tenant_id, limit=req.limit)
    payload = {
        "tenant_id": ctx.tenant_id,
        "results": rows,
        "citations": [c.__dict__ for c in citations],
    }
    cache.set(key, payload)
    metrics.inc("retrieval_cache_miss")
    metrics.inc("retrieval_requests")
    return payload


@app.post("/agent")
async def agent(req: AgentRequest, ctx: TenantContext = Depends(tenant_context)):
    try:
        metrics.inc("agent_requests")
        return await _agent_runtime.answer(f"{ctx.tenant_id}:{req.user_id}", req.task)
    except Exception as exc:
        metrics.inc("agent_errors")
        raise HTTPException(status_code=502, detail="Agent runtime failed") from exc


@app.post("/chat")
def chat(req: ChatRequest, ctx: TenantContext = Depends(tenant_context)):
    tokenizer, model = get_model()
    messages = [
        {"role": "system", "content": req.system},
        {"role": "user", "content": req.message},
    ]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    try:
        output = model.generate(
            **inputs,
            max_new_tokens=req.max_new_tokens,
            do_sample=True,
            temperature=0.2,
            top_p=0.9,
        )
    except Exception as exc:
        metrics.inc("chat_errors")
        raise HTTPException(status_code=500, detail="Model generation failed") from exc
    answer = tokenizer.decode(output[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
    metrics.inc("chat_requests")
    return {"answer": answer, "model": MODEL_NAME, "tenant_id": ctx.tenant_id}
