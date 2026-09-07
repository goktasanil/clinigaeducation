from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CapabilityDecision:
    capabilities: tuple[str, ...]
    reason: str


class CapabilityRouter:
    """Select advanced agent capabilities from task signals without bypassing policy."""

    def choose(self, task: str, *, has_context: bool = False, has_test_log: bool = False) -> CapabilityDecision:
        text = task.lower()
        caps: list[str] = []
        if any(k in text for k in ("repo", "repository", "code", "bug", "refactor", "implement", "fix", "test")):
            caps += ["repo_engineering", "patch_editing", "self_review"]
        if has_context or any(k in text for k in ("long context", "many files", "multi-file", "cross-file")):
            caps.append("hierarchical_context")
        if has_test_log or any(k in text for k in ("test failure", "traceback", "failing test", "ci failure")):
            caps.append("test_failure_diagnosis")
        if any(k in text for k in ("issue", "ticket", "pull request", "pr ")):
            caps.append("issue_execution_loop")
        if any(k in text for k in ("terminal", "command", "pytest", "git status")):
            caps.append("safe_terminal_planning")
        if not caps:
            caps.append("general_reasoning")
        # stable order, no duplicates
        unique = tuple(dict.fromkeys(caps))
        return CapabilityDecision(unique, "Selected from task/context signals under existing tool permissions")
