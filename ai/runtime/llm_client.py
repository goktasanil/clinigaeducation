from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Iterable

import httpx

from ai.security.url_policy import allowed_hosts_from_env, validate_outbound_url


@dataclass
class LLMResponse:
    text: str
    model: str


class OpenAICompatibleLLM:
    """Minimal client for vLLM or an explicitly allowed OpenAI-compatible gateway."""

    def __init__(self, base_url: str | None = None, api_key: str | None = None):
        raw = (base_url or os.getenv("CLINIGA_LLM_BASE_URL") or "http://localhost:8001/v1").strip()
        hosts = allowed_hosts_from_env(
            "CLINIGA_LLM_ALLOWED_HOSTS",
            {"vllm", "litellm", "ollama", "localhost", "127.0.0.1", "::1"},
        )
        self.base_url = validate_outbound_url(raw, allowed_hosts=hosts)
        self.api_key = api_key or os.getenv("CLINIGA_LLM_API_KEY", "local")
        self.timeout = float(os.getenv("CLINIGA_LLM_TIMEOUT", "120"))

    async def chat(self, messages: Iterable[dict], model: str, temperature: float = 0.2, max_tokens: int = 1024) -> LLMResponse:
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "model": model,
            "messages": list(messages),
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=False) as client:
            response = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
        return LLMResponse(text=data["choices"][0]["message"]["content"], model=data.get("model", model))
