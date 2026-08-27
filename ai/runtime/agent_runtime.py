from __future__ import annotations

import os
from dataclasses import dataclass

from ai.agents.capability_router import CapabilityRouter
from ai.agents.context_manager import ContextItem, HierarchicalContextManager
from ai.agents.test_diagnosis import TestFailureDiagnoser
from ai.runtime.llm_client import OpenAICompatibleLLM
from ai.runtime.model_router import ModelRouter
from ai.skills.memory import recall, remember


SYSTEM = "You are CliniGA AI. Be accurate, grounded, privacy-conscious, explicit about uncertainty, and never bypass tool or security policy."

CAPABILITY_GUIDANCE = {
    "repo_engineering": "For repository work: map context, make the smallest coherent change, preserve interfaces, validate focused tests, then self-review cross-file consistency.",
    "patch_editing": "Prefer minimal reviewable patches over whole-file rewrites; describe exact files and intended diffs before any write action.",
    "self_review": "Before finalizing, check objective coverage, regressions, edge cases, public API compatibility, tests, secrets, permissions, and unsafe tool use.",
    "hierarchical_context": "Use summaries first and high-priority details second. Do not overload the prompt with irrelevant source material.",
    "test_failure_diagnosis": "Diagnose the smallest reproducible failure before editing. Do not bypass permission or security controls to make tests pass.",
    "issue_execution_loop": "Use issue → plan → patch → test → review sequencing; do not claim a write occurred unless an approved write tool actually executed it.",
    "safe_terminal_planning": "Propose only allowlisted, scoped terminal checks and keep destructive/network-sensitive commands behind explicit tool policy and approval.",
    "general_reasoning": "Answer normally with grounded reasoning and clear uncertainty.",
}


@dataclass
class AgentRuntime:
    llm: OpenAICompatibleLLM
    router: ModelRouter
    capability_router: CapabilityRouter
    context_manager: HierarchicalContextManager
    diagnoser: TestFailureDiagnoser

    @classmethod
    def create(cls):
        return cls(
            llm=OpenAICompatibleLLM(),
            router=ModelRouter(
                default_model=os.getenv("CLINIGA_GENERAL_MODEL", "Qwen/Qwen3-8B"),
                reasoning_model=os.getenv("CLINIGA_REASONING_MODEL", "Qwen/Qwen3-8B"),
                code_model=os.getenv("CLINIGA_CODE_MODEL", "Qwen/Qwen3-Coder-30B-A3B-Instruct"),
            ),
            capability_router=CapabilityRouter(),
            context_manager=HierarchicalContextManager(max_chars=int(os.getenv("CLINIGA_AGENT_CONTEXT_CHARS", "120000"))),
            diagnoser=TestFailureDiagnoser(),
        )

    async def answer(self, user_id: str, task: str, *, context: list[dict] | None = None, test_log: str | None = None) -> dict:
        route = self.router.choose(task)
        context = context or []
        decision = self.capability_router.choose(task, has_context=bool(context), has_test_log=bool(test_log))

        memories = []
        try:
            raw = recall(user_id, task, limit=5)
            memories = raw.get("results", raw) if isinstance(raw, dict) else raw
        except Exception:
            memories = []

        memory_text = "\n".join(str(m) for m in memories[:5])
        context_text = ""
        if context:
            summaries = []
            details = []
            for i, row in enumerate(context):
                item = ContextItem(
                    key=str(row.get("key", i)),
                    text=str(row.get("text", "")),
                    priority=int(row.get("priority", 0)),
                    group=str(row.get("group", "general")),
                )
                (summaries if row.get("summary", False) else details).append(item)
            context_text = self.context_manager.build(summaries, details)

        diagnosis_text = ""
        diagnosis = None
        if test_log:
            diagnosis = self.diagnoser.diagnose(test_log)
            diagnosis_text = f"Test failure diagnosis: category={diagnosis.category}; next_action={diagnosis.next_action}; evidence={diagnosis.evidence}"

        guidance = "\n".join(f"- {CAPABILITY_GUIDANCE[c]}" for c in decision.capabilities)
        messages = [
            {"role": "system", "content": SYSTEM},
            {"role": "system", "content": f"Active capabilities:\n{guidance}"},
            {"role": "system", "content": f"Relevant memory, if any:\n{memory_text}"},
        ]
        if context_text:
            messages.append({"role": "system", "content": f"Hierarchical task context:\n{context_text}"})
        if diagnosis_text:
            messages.append({"role": "system", "content": diagnosis_text})
        messages.append({"role": "user", "content": task})

        response = await self.llm.chat(messages, model=route.model)
        try:
            remember(user_id, f"User task: {task}\nCapabilities: {','.join(decision.capabilities)}\nAssistant summary: {response.text[:1200]}")
        except Exception:
            pass

        payload = {
            "answer": response.text,
            "model": response.model,
            "route_reason": route.reason,
            "memory_hits": len(memories),
            "capabilities": list(decision.capabilities),
            "capability_reason": decision.reason,
        }
        if diagnosis is not None:
            payload["test_diagnosis"] = {
                "category": diagnosis.category,
                "evidence": diagnosis.evidence,
                "next_action": diagnosis.next_action,
            }
        return payload
