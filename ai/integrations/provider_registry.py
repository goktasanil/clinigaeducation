from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

ProviderKind = Literal["llm", "rag", "browser", "orchestrator", "workflow", "backend", "observability", "validator", "eval"]


@dataclass(frozen=True)
class ProviderSpec:
    name: str
    kind: ProviderKind
    enabled: bool = False
    endpoint: str | None = None
    requires_approval_for_writes: bool = True


DEFAULT_PROVIDERS = {
    "litellm": ProviderSpec("litellm", "llm"),
    "ollama": ProviderSpec("ollama", "llm"),
    "gemini-cli": ProviderSpec("gemini-cli", "llm"),
    "llamaindex": ProviderSpec("llamaindex", "rag"),
    "haystack": ProviderSpec("haystack", "rag"),
    "dspy": ProviderSpec("dspy", "eval"),
    "lm-eval": ProviderSpec("lm-eval", "eval"),
    "docling": ProviderSpec("docling", "backend"),
    "paperqa": ProviderSpec("paperqa", "rag"),
    "qdrant": ProviderSpec("qdrant", "backend"),
    "pgvector": ProviderSpec("pgvector", "backend"),
    "stagehand": ProviderSpec("stagehand", "browser"),
    "crewai": ProviderSpec("crewai", "orchestrator"),
    "autogen": ProviderSpec("autogen", "orchestrator"),
    "smolagents": ProviderSpec("smolagents", "orchestrator"),
    "pydantic-ai": ProviderSpec("pydantic-ai", "orchestrator"),
    "n8n": ProviderSpec("n8n", "workflow"),
    "temporal": ProviderSpec("temporal", "workflow"),
    "supabase": ProviderSpec("supabase", "backend"),
    "phoenix": ProviderSpec("phoenix", "observability"),
    "opentelemetry": ProviderSpec("opentelemetry", "observability"),
    "helicone": ProviderSpec("helicone", "observability"),
    "guardrails": ProviderSpec("guardrails", "validator"),
    "deepeval": ProviderSpec("deepeval", "eval"),
    "openai-evals": ProviderSpec("openai-evals", "eval"),
}


def list_provider_names() -> list[str]:
    return sorted(DEFAULT_PROVIDERS)

