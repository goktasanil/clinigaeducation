from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Iterable


@dataclass
class RepoTask:
    objective: str
    files: list[str] = field(default_factory=list)
    tests: list[str] = field(default_factory=list)
    constraints: list[str] = field(default_factory=list)


@dataclass
class RepoResult:
    plan: list[str]
    touched_files: list[str]
    validation: list[str]
    review_notes: list[str]


class RepoEngineer:
    """Repo-level software-engineering scaffold.

    The workflow emphasizes planning, narrow edits, validation, and self-review.
    It does not execute arbitrary shell commands by itself; execution is delegated
    through approved tool adapters supplied by the host runtime.
    """

    def __init__(self, read_file: Callable[[str], str], run_check: Callable[[str], str]):
        self.read_file = read_file
        self.run_check = run_check

    def map_context(self, task: RepoTask) -> dict[str, str]:
        context: dict[str, str] = {}
        for path in task.files:
            try:
                context[path] = self.read_file(path)
            except Exception:
                context[path] = ""
        return context

    def plan(self, task: RepoTask, context: dict[str, str]) -> list[str]:
        steps = [
            f"Understand objective: {task.objective}",
            "Identify the smallest coherent set of files to change",
            "Preserve existing interfaces unless the task requires a change",
        ]
        if task.constraints:
            steps.append("Honor constraints: " + "; ".join(task.constraints))
        steps.extend([
            "Implement changes in dependency order",
            "Run focused tests first, then broader validation",
            "Review the diff for regressions, dead code, and security issues",
        ])
        return steps

    def validate(self, task: RepoTask) -> list[str]:
        results: list[str] = []
        for check in task.tests:
            results.append(self.run_check(check))
        return results

    def self_review(self, touched_files: Iterable[str]) -> list[str]:
        files = list(touched_files)
        notes = [
            "Check behavior against the original objective",
            "Check public APIs and backward compatibility",
            "Check error handling and edge cases",
            "Check tests cover the changed behavior",
            "Check secrets, permissions, and unsafe tool use",
        ]
        if len(files) > 1:
            notes.append("Check cross-file consistency and import/call-site updates")
        return notes
