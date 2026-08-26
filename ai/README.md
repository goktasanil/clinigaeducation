# CliniGA AI Engine

Production-oriented GPT-like assistant stack for CliniGA.

## Goals
- Open-weight LLM support
- LoRA/PEFT fine-tuning
- Retrieval-augmented generation (RAG)
- Tool calling and multi-step agents
- Long-term memory
- Evaluation and safety checks
- OpenAI-compatible serving option via vLLM
- FastAPI application gateway

## Recommended stack
- Orchestration: LangGraph
- Fine-tuning: Transformers + TRL + PEFT
- Serving: vLLM for GPU deployments, Transformers fallback for development
- Vector database: Qdrant
- Embeddings: sentence-transformers
- API: FastAPI

## Layout
- `app/`: API and runtime orchestration
- `training/`: LoRA fine-tuning
- `rag/`: ingestion and retrieval
- `evals/`: regression/evaluation harness
- `config/`: model/runtime defaults

## Security
Never commit API keys, model registry tokens, personal data, patient-identifying information, or confidential clinical material. Use approved, de-identified datasets only.

## Important
This is not OpenAI GPT-5.6 weights. It is infrastructure for building a GPT-like assistant around an open-weight model that you are licensed to use.