from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Iterable

_WORD_RE = re.compile(r"[A-Za-zÀ-ž0-9_.:-]{2,}")
_STOP = {
    "the", "and", "for", "with", "from", "this", "that", "into", "use", "using",
    "bir", "ve", "ile", "için", "icin", "bu", "şu", "su", "gibi", "olan",
}


@dataclass
class ToolCandidate:
    name: str
    purpose: str
    risk: str = "read"
    estimated_cost: float = 1.0


@dataclass
class ToolPlan:
    ordered_tools: list[str] = field(default_factory=list)
    rationale: list[str] = field(default_factory=list)


class AdaptiveToolPlanner:
    """Select the smallest relevant safe tool sequence for an objective.

    The caller's permission policy is authoritative. Replanning can never expand
    the allowed risk set and irrelevant higher-risk tools are not selected merely
    because another tool failed.
    """

    RISK_ORDER = {"read": 0, "compute": 1, "write": 2, "privileged": 3}

    @staticmethod
    def _terms(text: str) -> set[str]:
        return {
            token.lower()
            for token in _WORD_RE.findall(str(text or ""))
            if token.lower() not in _STOP
        }

    def _relevance(self, objective: str, candidate: ToolCandidate) -> int:
        objective_terms = self._terms(objective)
        candidate_terms = self._terms(candidate.name.replace(".", " ") + " " + candidate.purpose)
        return len(objective_terms & candidate_terms)

    def choose(
        self,
        objective: str,
        candidates: Iterable[ToolCandidate],
        allowed_risks: set[str],
    ) -> ToolPlan:
        if not str(objective or "").strip():
            raise ValueError("tool planning objective is required")
        invalid_risks = set(allowed_risks) - set(self.RISK_ORDER)
        if invalid_risks:
            raise ValueError(f"unknown allowed risks: {sorted(invalid_risks)}")

        scored = []
        seen_names: set[str] = set()
        for candidate in candidates:
            if candidate.name in seen_names or candidate.risk not in allowed_risks:
                continue
            if candidate.risk not in self.RISK_ORDER:
                continue
            if not 0 <= float(candidate.estimated_cost) <= 1_000_000:
                continue
            relevance = self._relevance(objective, candidate)
            seen_names.add(candidate.name)
            scored.append((candidate, relevance))

        # Prefer semantic relevance first, then lower risk/cost. If no candidate
        # has lexical overlap, retain only read/compute tools as conservative
        # discovery options rather than guessing a write/privileged action.
        if scored and not any(score > 0 for _, score in scored):
            scored = [
                pair for pair in scored
                if pair[0].risk in {"read", "compute"}
            ]
        scored.sort(
            key=lambda pair: (
                -pair[1],
                self.RISK_ORDER[pair[0].risk],
                pair[0].estimated_cost,
                pair[0].name,
            )
        )
        chosen = scored[:4]
        return ToolPlan(
            ordered_tools=[candidate.name for candidate, _ in chosen],
            rationale=[
                f"{candidate.name}: relevance={relevance}, {candidate.purpose} "
                f"({candidate.risk}, cost={candidate.estimated_cost})"
                for candidate, relevance in chosen
            ],
        )

    def replan_after_failure(
        self,
        failed_tool: str,
        remaining: Iterable[ToolCandidate],
        allowed_risks: set[str],
    ) -> ToolPlan:
        alternatives = [candidate for candidate in remaining if candidate.name != failed_tool]
        return self.choose(
            f"Recover safely from failure of {failed_tool}",
            alternatives,
            set(allowed_risks),
        )
