from __future__ import annotations

from pathlib import Path
from typing import Any

try:
    from nemoguardrails import LLMRails, RailsConfig
except Exception:
    LLMRails = RailsConfig = None  # type: ignore


class GuardrailEngine:
    def __init__(self, config_path: str = "ai/guardrails/config") -> None:
        self.config_path = Path(config_path)
        self.rails = None
        if LLMRails is not None and RailsConfig is not None and self.config_path.exists():
            config = RailsConfig.from_path(str(self.config_path))
            self.rails = LLMRails(config)

    async def generate(self, messages: list[dict[str, Any]]):
        if self.rails is None:
            return None
        return await self.rails.generate_async(messages=messages)

    @property
    def enabled(self) -> bool:
        return self.rails is not None
