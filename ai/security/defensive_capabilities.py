from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class SearchTarget:
    name: str
    authorized: bool = False
    source_type: str = "local"


class DefensiveCapabilityPolicy:
    """Policy for advanced agent behaviors.

    High-powered search and vulnerability analysis are allowed only on
    explicitly authorized targets. Sandbox/network escape, credential theft,
    persistence, covert channels, and privilege escalation are always denied.
    """

    ALWAYS_DENY = {
        "sandbox.escape",
        "network.bypass",
        "credential.collect",
        "credential.use_unapproved",
        "persistence.install",
        "covert_channel.create",
        "privilege_escalation",
        "exploit.external_target",
    }

    def ensure_action_allowed(self, action: str) -> None:
        if action in self.ALWAYS_DENY:
            raise PermissionError(f"Action is prohibited: {action}")

    def ensure_authorized_target(self, target: SearchTarget) -> None:
        if not target.authorized:
            raise PermissionError(f"Target is not authorized: {target.name}")


class AdaptivePlanner:
    """Re-plan around failed tools without weakening security constraints."""

    def next_safe_options(self, failed_action: str, alternatives: Iterable[str]) -> list[str]:
        policy = DefensiveCapabilityPolicy()
        safe = []
        for option in alternatives:
            try:
                policy.ensure_action_allowed(option)
            except PermissionError:
                continue
            safe.append(option)
        return safe


policy = DefensiveCapabilityPolicy()
