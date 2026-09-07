from __future__ import annotations

from dataclasses import dataclass

from ai.integrations.external_providers import N8NProvider, OllamaProvider, StagehandProvider, llamaindex
from ai.integrations.litellm_gateway import LiteLLMGateway


@dataclass(frozen=True)
class ProviderDecision:
    mode: str
    provider: str
    reason: str


class RuntimeProviderRouter:
    """Choose optional providers without bypassing host authorization.

    Browser and workflow execution are explicit-only (`browser:` / `workflow:`)
    so ordinary prompts cannot silently trigger external side effects.
    LLM providers are safe read/compute fallbacks and remain opt-in by env config.
    """

    def __init__(self) -> None:
        self.litellm = LiteLLMGateway()
        self.ollama = OllamaProvider()
        self.stagehand = StagehandProvider()
        self.n8n = N8NProvider()

    def decide(self, task: str) -> ProviderDecision:
        text = task.strip().lower()
        if text.startswith("browser:"):
            if self.stagehand.enabled:
                return ProviderDecision("external_action", "stagehand", "explicit browser task")
            return ProviderDecision("local", "default", "stagehand not configured")
        if text.startswith("workflow:"):
            if self.n8n.enabled:
                return ProviderDecision("external_action", "n8n", "explicit workflow task")
            return ProviderDecision("local", "default", "n8n not configured")
        if "rag:" in text and llamaindex.enabled:
            return ProviderDecision("rag", "llamaindex", "optional LlamaIndex is installed")
        if self.litellm.enabled:
            return ProviderDecision("llm", "litellm", "configured multi-provider gateway")
        if self.ollama.enabled:
            return ProviderDecision("llm", "ollama", "configured local model provider")
        return ProviderDecision("llm", "default", "use primary OpenAI-compatible/vLLM client")

    async def external_action(self, provider: str, task: str, metadata: dict | None = None) -> dict:
        payload = {"task": task, "metadata": metadata or {}}
        if provider == "stagehand":
            return await self.stagehand.trigger(payload)
        if provider == "n8n":
            return await self.n8n.trigger(payload)
        raise ValueError(f"Unsupported external action provider: {provider}")
