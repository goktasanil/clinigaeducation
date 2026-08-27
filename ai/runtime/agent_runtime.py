from __future__ import annotations

import os
from dataclasses import dataclass

from ai.integrations.runtime_router import RuntimeProviderRouter
from ai.runtime.llm_client import OpenAICompatibleLLM
from ai.runtime.model_router import ModelRouter
from ai.skills.memory import recall, remember


SYSTEM = "You are CliniGA AI. Be accurate, grounded, privacy-conscious, and explicit about uncertainty."


@dataclass
class AgentRuntime:
    llm: OpenAICompatibleLLM
    router: ModelRouter
    providers: RuntimeProviderRouter

    @classmethod
    def create(cls):
        return cls(
            llm=OpenAICompatibleLLM(),
            router=ModelRouter(
                default_model=os.getenv("CLINIGA_GENERAL_MODEL", "Qwen/Qwen3-8B"),
                reasoning_model=os.getenv("CLINIGA_REASONING_MODEL", "Qwen/Qwen3-8B"),
                code_model=os.getenv("CLINIGA_CODE_MODEL", "Qwen/Qwen3-Coder-30B-A3B-Instruct"),
            ),
            providers=RuntimeProviderRouter(),
        )

    async def _chat_via_provider(self, provider: str, model: str, messages: list[dict]):
        if provider == "litellm":
            data = await self.providers.litellm.chat(model=model, messages=messages)
            choice = (data.get("choices") or [{}])[0]
            message = choice.get("message") or {}
            return str(message.get("content") or ""), str(data.get("model") or model)
        if provider == "ollama":
            data = await self.providers.ollama.chat(model=model, messages=messages)
            message = data.get("message") or {}
            return str(message.get("content") or ""), str(data.get("model") or model)
        response = await self.llm.chat(messages, model=model)
        return response.text, response.model

    async def answer(self, user_id: str, task: str, *, context: str = "", test_log: str = "") -> dict:
        route = self.router.choose(task)
        provider_decision = self.providers.decide(task)

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
        ]
        if context:
            messages.append({"role": "system", "content": f"Additional task context:\n{context[:120000]}"})
        if test_log:
            messages.append({"role": "system", "content": f"Relevant test/runtime log:\n{test_log[-12000:]}"})
        messages.append({"role": "user", "content": task})

        if provider_decision.mode == "external_action":
            result = await self.providers.external_action(
                provider_decision.provider,
                task,
                {"user_id": user_id, "model_route": route.reason},
            )
            return {
                "answer": result,
                "model": None,
                "route_reason": route.reason,
                "provider": provider_decision.provider,
                "provider_reason": provider_decision.reason,
                "memory_hits": len(memories),
            }

        text, model_name = await self._chat_via_provider(provider_decision.provider, route.model, messages)
        try:
            remember(user_id, f"User task: {task}\nAssistant summary: {text[:1200]}")
        except Exception:
            pass
        return {
            "answer": text,
            "model": model_name,
            "route_reason": route.reason,
            "provider": provider_decision.provider,
            "provider_reason": provider_decision.reason,
            "memory_hits": len(memories),
        }
