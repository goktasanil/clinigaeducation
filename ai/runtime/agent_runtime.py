from __future__ import annotations

import os
from dataclasses import dataclass

from ai.agents.context_manager import ContextItem, HierarchicalContextManager
from ai.agents.test_diagnosis import TestFailureDiagnoser
from ai.integrations.ai_federation import AIFederation
from ai.integrations.domain_profiles import expert_context, select_domain_profiles
from ai.integrations.runtime_router import RuntimeProviderRouter
from ai.runtime.benchmark_profiles import benchmark_profile, post_generation_review
from ai.runtime.llm_client import OpenAICompatibleLLM
from ai.runtime.model_router import ModelRouter
from ai.skills.memory import recall, remember


SYSTEM = "You are CliniGA AI. Be accurate, grounded, privacy-conscious, and explicit about uncertainty."


def detect_capabilities(task: str, has_context: bool, has_test_log: bool) -> list[str]:
    text = task.lower()
    caps: list[str] = ["general_reasoning"]
    if any(k in text for k in ("repo", "repository", "codebase", "multi-file", "issue", "bug", "fix", "kod", "hata")):
        caps += ["repo_engineering", "repository_map", "swebench_pro_protocol", "patch_editing", "self_review"]
    if has_context:
        caps.append("hierarchical_context")
    if has_test_log or any(k in text for k in ("test fail", "ci fail", "traceback", "error log")):
        caps.append("test_failure_diagnosis")
    if "issue" in text:
        caps.append("issue_execution_loop")
    if any(k in text for k in ("terminal", "pytest", "command", "cli")):
        caps.append("safe_terminal_planning")
    if any(k in text for k in ("clinical", "medical", "health", "patient", "drug", "dose", "guideline", "trial", "klinik", "tıbbi", "hasta", "ilaç", "doz")):
        caps.append("professional_health_review")
    if text.startswith("consult:") or text.startswith("consult-many:"):
        caps.append("ai_federation")
    return list(dict.fromkeys(caps))


@dataclass
class AgentRuntime:
    llm: OpenAICompatibleLLM
    router: ModelRouter
    providers: RuntimeProviderRouter
    federation: AIFederation

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
            federation=AIFederation(),
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

    def _build_context(self, context, *, task: str = "") -> str:
        if not context:
            return ""
        if isinstance(context, str):
            return context[:120000]
        summaries: list[ContextItem] = []
        details: list[ContextItem] = []
        for raw in context:
            item = ContextItem(
                key=str(raw.get("key", "context")),
                text=str(raw.get("text", "")),
                priority=int(raw.get("priority", 0)),
                group=str(raw.get("group", "general")),
            )
            (summaries if raw.get("summary") else details).append(item)
        return HierarchicalContextManager(max_chars=120000, max_tokens=30000).build(
            summaries,
            details,
            query=task,
        )

    async def _maybe_consult_peer(self, task: str) -> dict | None:
        if task.startswith("consult:"):
            _, peer_name, prompt = task.split(":", 2)
            return await self.federation.ask(peer_name.strip(), prompt.strip())
        if task.startswith("consult-many:"):
            _, peer_list, prompt = task.split(":", 2)
            peers = [name.strip() for name in peer_list.split(",") if name.strip()]
            answers = await self.federation.consult_many(peers, prompt.strip())
            return {"peers": peers, "answers": answers}
        return None

    async def answer(self, user_id: str, task: str, *, context=None, test_log: str | None = None) -> dict:
        route = self.router.choose(task)
        provider_decision = self.providers.decide(task)
        context_text = self._build_context(context, task=task)
        test_log = test_log or ""
        expert_providers, expert_capabilities, expert_prompt = expert_context(task)
        domain_profiles = [profile.name for profile in select_domain_profiles(task)]
        capabilities = list(dict.fromkeys(
            detect_capabilities(task, bool(context_text), bool(test_log)) + expert_capabilities
        ))
        profile = benchmark_profile(task)

        peer_result = await self._maybe_consult_peer(task)
        if peer_result is not None:
            return {
                "answer": peer_result,
                "model": None,
                "route_reason": "explicit AI federation consultation",
                "provider": "ai_federation",
                "provider_reason": "explicit consult prefix",
                "domain_profiles": domain_profiles,
                "expert_providers": expert_providers,
                "capabilities": capabilities,
                "diagnosis": None,
                "quality_review": None,
                "memory_hits": 0,
            }

        diagnosis = None
        if test_log:
            d = TestFailureDiagnoser().diagnose(test_log)
            diagnosis = {
                "category": d.category,
                "evidence": d.evidence,
                "next_action": d.next_action,
                "fingerprint": d.fingerprint,
            }

        memories = []
        try:
            raw = recall(user_id, task, limit=5)
            memories = raw.get("results", raw) if isinstance(raw, dict) else raw
        except Exception:
            memories = []

        memory_text = "\n".join(str(m)[:3000] for m in memories[:5])
        messages = [
            {"role": "system", "content": SYSTEM},
            {"role": "system", "content": f"Active capabilities: {', '.join(capabilities)}"},
            {"role": "system", "content": expert_prompt},
            {"role": "system", "content": f"Relevant memory, if any:\n{memory_text}"},
        ]
        if profile:
            messages.append({"role": "system", "content": f"Benchmark-derived execution profile:\n{profile}"})
        if context_text:
            messages.append({"role": "system", "content": f"Additional task context:\n{context_text}"})
        if diagnosis:
            messages.append({"role": "system", "content": f"Test failure diagnosis: {diagnosis}"})
        messages.append({"role": "user", "content": task})

        if provider_decision.mode == "external_action":
            result = await self.providers.external_action(
                provider_decision.provider,
                task,
                {
                    "user_id": user_id,
                    "model_route": route.reason,
                    "capabilities": capabilities,
                    "domain_profiles": domain_profiles,
                    "expert_providers": expert_providers,
                },
            )
            return {
                "answer": result,
                "model": None,
                "route_reason": route.reason,
                "provider": provider_decision.provider,
                "provider_reason": provider_decision.reason,
                "domain_profiles": domain_profiles,
                "expert_providers": expert_providers,
                "capabilities": capabilities,
                "diagnosis": diagnosis,
                "quality_review": None,
                "memory_hits": len(memories),
            }

        text, model_name = await self._chat_via_provider(provider_decision.provider, route.model, messages)
        quality_review = post_generation_review(task, text)
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
            "domain_profiles": domain_profiles,
            "expert_providers": expert_providers,
            "capabilities": capabilities,
            "diagnosis": diagnosis,
            "quality_review": quality_review,
            "memory_hits": len(memories),
        }
