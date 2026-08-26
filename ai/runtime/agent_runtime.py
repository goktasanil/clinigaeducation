from __future__ import annotations

import os
from dataclasses import dataclass

from ai.runtime.llm_client import OpenAICompatibleLLM
from ai.runtime.model_router import ModelRouter
from ai.skills.memory import recall, remember


SYSTEM = "You are CliniGA AI. Be accurate, grounded, privacy-conscious, and explicit about uncertainty."


@dataclass
class AgentRuntime:
    llm: OpenAICompatibleLLM
    router: ModelRouter

    @classmethod
    def create(cls):
        return cls(
            llm=OpenAICompatibleLLM(),
            router=ModelRouter(
                default_model=os.getenv("CLINIGA_GENERAL_MODEL", "Qwen/Qwen3-8B"),
                reasoning_model=os.getenv("CLINIGA_REASONING_MODEL", "Qwen/Qwen3-8B"),
                code_model=os.getenv("CLINIGA_CODE_MODEL", "Qwen/Qwen3-Coder-30B-A3B-Instruct"),
            ),
        )

    async def answer(self, user_id: str, task: str) -> dict:
        route = self.router.choose(task)
        memories = []
        try:
            raw = recall(user_id, task, limit=5)
            memories = raw.get("results", raw) if isinstance(raw, dict) else raw
        except Exception:
            memories = []

        memory_text = "\n".join(str(m) for m in memories[:5])
        messages = [
            {"role": "system", "content": SYSTEM},
            {"role": "system", "content": f"Relevant memory, if any:\n{memory_text}"},
            {"role": "user", "content": task},
        ]
        response = await self.llm.chat(messages, model=route.model)
        try:
            remember(user_id, f"User task: {task}\nAssistant summary: {response.text[:1200]}")
        except Exception:
            pass
        return {"answer": response.text, "model": response.model, "route_reason": route.reason, "memory_hits": len(memories)}
