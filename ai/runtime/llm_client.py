from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any, Iterable

import httpx

from ai.observability.model_telemetry import HeliconeConfig, model_span


@dataclass
class LLMResponse:
    text: str
    model: str
    usage: dict[str, Any] = field(default_factory=dict)


class OpenAICompatibleLLM:
    """OpenAI-compatible client with content-free telemetry."""

    def __init__(self, base_url: str | None = None, api_key: str | None = None):
        configured_url = (base_url or os.getenv("CLINIGA_LLM_BASE_URL") or "http://localhost:8001/v1").rstrip("/")
        self.helicone = HeliconeConfig.from_env()
        self.helicone.validate()
        self.base_url = self.helicone.proxy_url if self.helicone.enabled else configured_url
        self.api_key = api_key or os.getenv("CLINIGA_LLM_API_KEY", "local")
        self.timeout = float(os.getenv("CLINIGA_LLM_TIMEOUT", "120"))

    async def chat(
        self,
        messages: Iterable[dict],
        model: str,
        temperature: float = 0.2,
        max_tokens: int = 1024,
        *,
        tenant_id: str | None = None,
        user_id: str | None = None,
        session_id: str | None = None,
    ) -> LLMResponse:
        message_list = list(messages)
        headers = {"Authorization": f"Bearer {self.api_key}"}
        headers.update(
            self.helicone.headers(
                user_id=user_id,
                session_id=session_id,
                properties={"model": model, "tenant": tenant_id or "none"},
            )
        )
        payload = {
            "model": model,
            "messages": message_list,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        with model_span(
            "chat",
            model=model,
            tenant_id=tenant_id,
            attributes={"message_count": len(message_list), "max_tokens": max_tokens},
        ) as span:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
            usage = data.get("usage") or {}
            if span is not None:
                for key in ("prompt_tokens", "completion_tokens", "total_tokens"):
                    if isinstance(usage.get(key), int):
                        span.set_attribute(f"gen_ai.usage.{key}", usage[key])
        return LLMResponse(
            text=data["choices"][0]["message"]["content"],
            model=data.get("model", model),
            usage=usage,
        )

