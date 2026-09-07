from __future__ import annotations

import os

import httpx

from ai.security.url_policy import allowed_hosts_from_env, validate_outbound_url


class LiteLLMGateway:
    """OpenAI-compatible LiteLLM proxy adapter with outbound host policy."""

    def __init__(self) -> None:
        raw = os.getenv("CLINIGA_LITELLM_URL", "").strip()
        self.base_url = ""
        if raw:
            hosts = allowed_hosts_from_env(
                "CLINIGA_LLM_ALLOWED_HOSTS",
                {"litellm", "vllm", "localhost", "127.0.0.1", "::1"},
            )
            self.base_url = validate_outbound_url(raw, allowed_hosts=hosts)
        self.api_key = os.getenv("CLINIGA_LITELLM_API_KEY", "")

    @property
    def enabled(self) -> bool:
        return bool(self.base_url)

    async def chat(self, *, model: str, messages: list[dict], timeout: float = 60.0) -> dict:
        if not self.enabled:
            raise RuntimeError("LiteLLM gateway is not configured")
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json={"model": model, "messages": messages},
            )
            response.raise_for_status()
            return response.json()
