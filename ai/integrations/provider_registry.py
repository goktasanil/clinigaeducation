from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

ProviderKind = Literal[
    "llm", "rag", "browser", "orchestrator", "workflow", "backend",
    "observability", "validator", "eval", "optimizer", "typed_agent",
    "coding_agent", "inference", "distributed", "memory", "multimodal",
]


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
    "openfable": ProviderSpec("openfable", "rag"),
    "graphrag": ProviderSpec("graphrag", "rag"),
    "dspy": ProviderSpec("dspy", "optimizer"),
    "stagehand": ProviderSpec("stagehand", "browser"),
    "crewai": ProviderSpec("crewai", "orchestrator"),
    "autogen": ProviderSpec("autogen", "orchestrator"),
    "smolagents": ProviderSpec("smolagents", "orchestrator"),
    "pydantic-ai": ProviderSpec("pydantic-ai", "typed_agent"),
    "swe-agent": ProviderSpec("swe-agent", "coding_agent"),
    "openhands": ProviderSpec("openhands", "coding_agent"),
    "aider": ProviderSpec("aider", "coding_agent"),
    "n8n": ProviderSpec("n8n", "workflow"),
    "temporal": ProviderSpec("temporal", "workflow"),
    "dagster": ProviderSpec("dagster", "workflow"),
    "ray": ProviderSpec("ray", "distributed"),
    "supabase": ProviderSpec("supabase", "backend"),
    "phoenix": ProviderSpec("phoenix", "observability"),
    "helicone": ProviderSpec("helicone", "observability"),
    "guardrails": ProviderSpec("guardrails", "validator"),
    "deepeval": ProviderSpec("deepeval", "eval"),
    "openai-evals": ProviderSpec("openai-evals", "eval"),
    "lm-eval-harness": ProviderSpec("lm-eval-harness", "eval"),
    "vllm": ProviderSpec("vllm", "inference"),
    "sglang": ProviderSpec("sglang", "inference"),
    "transformers": ProviderSpec("transformers", "inference"),
    "graphiti": ProviderSpec("graphiti", "memory"),
    "livekit-agents": ProviderSpec("livekit-agents", "multimodal"),
}


def list_provider_names() -> list[str]:
    return sorted(DEFAULT_PROVIDERS)
