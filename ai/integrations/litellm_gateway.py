from __future__ import annotations

import os
import httpx


class LiteLLMGateway:
    """OpenAI-compatible LiteLLM proxy adapter.

    The gateway is opt-in and never embeds credentials in code. Configure with
    CLINIGA_LITELLM_URL and CLINIGA_LITELLM_API_KEY at runtime.
    """

    def __init__(self) -> None:
        self.base_url = os.getenv("CLINIGA_LITELLM_URL", "").rstrip("/")
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
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json={"model": model, "messages": messages},
            )
            response.raise_for_status()
            return response.json()
