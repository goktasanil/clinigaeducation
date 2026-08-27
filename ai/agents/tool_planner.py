from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable


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
    """Selects the smallest safe tool sequence for an objective.

    Higher-risk tools are never selected merely because a lower-risk tool failed.
    The caller's permission policy remains authoritative.
    """

    RISK_ORDER = {"read": 0, "compute": 1, "write": 2, "privileged": 3}

    def choose(self, objective: str, candidates: Iterable[ToolCandidate], allowed_risks: set[str]) -> ToolPlan:
        usable = [c for c in candidates if c.risk in allowed_risks]
        usable.sort(key=lambda c: (self.RISK_ORDER.get(c.risk, 99), c.estimated_cost, c.name))
        chosen = usable[:4]
        return ToolPlan(
            ordered_tools=[c.name for c in chosen],
            rationale=[f"{c.name}: {c.purpose} ({c.risk}, cost={c.estimated_cost})" for c in chosen],
        )

    def replan_after_failure(self, failed_tool: str, remaining: Iterable[ToolCandidate], allowed_risks: set[str]) -> ToolPlan:
        alternatives = [c for c in remaining if c.name != failed_tool]
        return self.choose(f"Recover from failure of {failed_tool}", alternatives, allowed_risks)
