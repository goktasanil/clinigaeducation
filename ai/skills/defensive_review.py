from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from ai.security.defensive_capabilities import SearchTarget, policy
from .registry import Skill, registry


@dataclass(frozen=True)
class Finding:
    title: str
    severity: str
    evidence: str
    remediation: str


def review_authorized_code(target: SearchTarget, findings: Iterable[Finding]):
    """Return defensive findings only for explicitly authorized targets.

    This skill does not execute exploits, steal credentials, bypass controls,
    or attack third-party infrastructure.
    """
    policy.ensure_authorized_target(target)
    return {
        "target": target.name,
        "mode": "defensive-only",
        "findings": [f.__dict__ for f in findings],
    }


registry.register(Skill(
    name="security.defensive_review",
    description="Review an explicitly authorized codebase or system defensively and return remediation-focused findings.",
    handler=review_authorized_code,
))
