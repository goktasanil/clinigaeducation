from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

ProviderKind = Literal["llm", "rag", "browser", "orchestrator", "workflow", "backend", "observability", "validator", "eval", "optimizer", "typed_agent"]


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
    "dspy": ProviderSpec("dspy", "optimizer"),
    "stagehand": ProviderSpec("stagehand", "browser"),
    "crewai": ProviderSpec("crewai", "orchestrator"),
    "autogen": ProviderSpec("autogen", "orchestrator"),
    "smolagents": ProviderSpec("smolagents", "orchestrator"),
    "pydantic-ai": ProviderSpec("pydantic-ai", "typed_agent"),
    "n8n": ProviderSpec("n8n", "workflow"),
    "temporal": ProviderSpec("temporal", "workflow"),
    "dagster": ProviderSpec("dagster", "workflow"),
    "supabase": ProviderSpec("supabase", "backend"),
    "phoenix": ProviderSpec("phoenix", "observability"),
    "helicone": ProviderSpec("helicone", "observability"),
    "guardrails": ProviderSpec("guardrails", "validator"),
    "deepeval": ProviderSpec("deepeval", "eval"),
    "openai-evals": ProviderSpec("openai-evals", "eval"),
}


def list_provider_names() -> list[str]:
    return sorted(DEFAULT_PROVIDERS)
