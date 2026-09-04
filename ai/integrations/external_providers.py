from __future__ import annotations

import os
from typing import Any

import httpx

from ai.security.url_policy import allowed_hosts_from_env, validate_outbound_url


class OllamaProvider:
    def __init__(self) -> None:
        raw = os.getenv("CLINIGA_OLLAMA_URL", "").strip()
        self.base_url = ""
        if raw:
            hosts = allowed_hosts_from_env(
                "CLINIGA_LLM_ALLOWED_HOSTS",
                {"ollama", "localhost", "127.0.0.1", "::1"},
            )
            self.base_url = validate_outbound_url(raw, allowed_hosts=hosts)

    @property
    def enabled(self) -> bool:
        return bool(self.base_url)

    async def chat(self, model: str, messages: list[dict], timeout: float = 60.0) -> dict:
        if not self.enabled:
            raise RuntimeError("Ollama is not configured")
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json={"model": model, "messages": messages, "stream": False},
            )
            response.raise_for_status()
            return response.json()


class WebhookProvider:
    def __init__(self, env_name: str, name: str) -> None:
        raw = os.getenv(env_name, "").strip()
        self.name = name
        self.url = ""
        if raw:
            hosts = allowed_hosts_from_env(
                "CLINIGA_PROVIDER_ALLOWED_HOSTS",
                {"stagehand", "n8n", "localhost", "127.0.0.1", "::1"},
            )
            self.url = validate_outbound_url(raw, allowed_hosts=hosts)

    @property
    def enabled(self) -> bool:
        return bool(self.url)

    async def trigger(self, payload: dict[str, Any], timeout: float = 30.0) -> dict:
        if not self.enabled:
            raise RuntimeError(f"{self.name} is not configured")
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
            response = await client.post(self.url, json=payload)
            response.raise_for_status()
            try:
                return response.json()
            except ValueError:
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
