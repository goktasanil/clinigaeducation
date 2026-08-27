from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

import httpx


@dataclass(frozen=True)
class ProviderStatus:
    name: str
    enabled: bool
    mode: str


class OllamaProvider:
    def __init__(self) -> None:
        self.base_url = os.getenv("CLINIGA_OLLAMA_URL", "").rstrip("/")

    @property
    def enabled(self) -> bool:
        return bool(self.base_url)

    async def chat(self, model: str, messages: list[dict], timeout: float = 60.0) -> dict:
        if not self.enabled:
            raise RuntimeError("Ollama is not configured")
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json={"model": model, "messages": messages, "stream": False},
            )
            response.raise_for_status()
            return response.json()


class WebhookProvider:
    def __init__(self, env_name: str, name: str) -> None:
        self.url = os.getenv(env_name, "").strip()
        self.name = name

    @property
    def enabled(self) -> bool:
        return bool(self.url)

    async def trigger(self, payload: dict[str, Any], timeout: float = 30.0) -> dict:
        if not self.enabled:
            raise RuntimeError(f"{self.name} is not configured")
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(self.url, json=payload)
            response.raise_for_status()
            try:
                return response.json()
            except Exception:
                return {"status": "ok", "text": response.text[:2000]}


class StagehandProvider(WebhookProvider):
    def __init__(self) -> None:
        super().__init__("CLINIGA_STAGEHAND_ENDPOINT", "stagehand")


class N8NProvider(WebhookProvider):
    def __init__(self) -> None:
        super().__init__("CLINIGA_N8N_WEBHOOK", "n8n")


class OptionalLibraryProvider:
    def __init__(self, module_name: str, name: str) -> None:
        self.module_name = module_name
        self.name = name

    @property
    def enabled(self) -> bool:
        try:
            __import__(self.module_name)
            return True
        except Exception:
            return False


llamaindex = OptionalLibraryProvider("llama_index", "llamaindex")
crewai = OptionalLibraryProvider("crewai", "crewai")
haystack = OptionalLibraryProvider("haystack", "haystack")
dspy = OptionalLibraryProvider("dspy", "dspy")
pydantic_ai = OptionalLibraryProvider("pydantic_ai", "pydantic-ai")
temporal = OptionalLibraryProvider("temporalio", "temporal")
pgvector = OptionalLibraryProvider("pgvector", "pgvector")
docling = OptionalLibraryProvider("docling", "docling")
paperqa = OptionalLibraryProvider("paperqa", "paperqa")
lm_eval = OptionalLibraryProvider("lm_eval", "lm-eval")

