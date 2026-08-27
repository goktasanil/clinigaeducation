from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

ProviderKind = Literal["llm", "rag", "browser", "orchestrator", "workflow", "backend"]


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
    "stagehand": ProviderSpec("stagehand", "browser"),
    "crewai": ProviderSpec("crewai", "orchestrator"),
    "n8n": ProviderSpec("n8n", "workflow"),
    "supabase": ProviderSpec("supabase", "backend"),
}


def list_provider_names() -> list[str]:
    return sorted(DEFAULT_PROVIDERS)
