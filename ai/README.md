# CliniGA AI Engine

Production-oriented GPT-like assistant stack for CliniGA.

## Goals
- Open-weight LLM support
- LoRA/PEFT fine-tuning
- Retrieval-augmented generation (RAG) with Haystack pipelines and DSPy optimization
- Typed PydanticAI agents and durable Temporal workflows
- Long-term memory
- Evaluation and safety checks
- OpenAI-compatible serving via vLLM
- FastAPI application gateway

## Recommended stack
- Orchestration: LangGraph
- Fine-tuning: Transformers + TRL + PEFT
- Serving: vLLM on NVIDIA GPU, Transformers fallback for development
- Vector databases: sensitivity-aware Qdrant / pgvector routing
- Embeddings: sentence-transformers
- API: FastAPI
- Telemetry: content-free OpenTelemetry spans; Helicone is explicit opt-in only

See [`ADVANCED_STACK.md`](ADVANCED_STACK.md) for configuration, threat boundaries, and adapter examples.

## GPU quick start
1. Install Docker, NVIDIA driver and NVIDIA Container Toolkit on a GPU host.
2. Copy `ai/.env.example` to `ai/.env` and adjust the model/GPU limits.
3. Start retrieval + model server + API:

```bash
cd ai
docker compose --profile gpu --env-file .env up -d
```

The vLLM OpenAI-compatible endpoint is exposed on host port `8001`; the CliniGA API is on `8000`.

Check:

```bash
curl http://localhost:8001/health
curl http://localhost:8000/health
curl -X POST http://localhost:8000/agent \
  -H 'Content-Type: application/json' \
  -d '{"message":"Plan a safe RAG architecture","user_id":"demo"}'
```

`CLINIGA_MODEL` defaults to `Qwen/Qwen3-8B`. Production hardware must have sufficient VRAM for the selected model/context. For smaller GPUs, select a smaller compatible instruct model or reduce `CLINIGA_MAX_MODEL_LEN`.

## Layout
- `app/`: API and runtime orchestration
- `runtime/`: OpenAI-compatible model client and model routing
- `agents/`: multi-agent orchestration
- `skills/`: memory, browser and MCP adapters
- `training/`: LoRA fine-tuning
- `rag/`: ingestion and retrieval
- `evals/`: regression/evaluation harness
- `security/`: tool authorization policy
- `config/`: model/runtime defaults

## Security
Never commit API keys, model registry tokens, personal data, patient-identifying information, or confidential clinical material. Use approved, de-identified datasets only. Write-capable tools remain approval-gated.

## Important
This is not OpenAI GPT-5.6 weights. It is infrastructure for building a GPT-like assistant around an open-weight model that you are licensed to use.
