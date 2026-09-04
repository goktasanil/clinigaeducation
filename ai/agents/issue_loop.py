from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from .patch_editor import PatchPlan
from .test_diagnosis import TestFailureDiagnoser, FailureDiagnosis


@dataclass
class IssueExecutionResult:
    plan: list[str]
    patches: list[PatchPlan]
    test_ok: bool
    diagnosis: FailureDiagnosis | None
    review_notes: list[str]


class IssueExecutionLoop:
    """Deterministic scaffold for issue -> plan -> patch -> test -> review.

    External writes remain the caller's responsibility and must pass the normal
    tool permission/approval layer before being applied.
    """

    def __init__(self) -> None:
        self.diagnoser = TestFailureDiagnoser()

    def run(
        self,
        issue: str,
        planner: Callable[[str], list[str]],
        patcher: Callable[[list[str]], list[PatchPlan]],
        tester: Callable[[list[PatchPlan]], tuple[bool, str]],
        reviewer: Callable[[str, list[PatchPlan]], list[str]],
    ) -> IssueExecutionResult:
        plan = planner(issue)
        patches = patcher(plan)
        ok, log = tester(patches)
        diagnosis = None if ok else self.diagnoser.diagnose(log)
        review_notes = reviewer(issue, patches)
        if not ok and diagnosis:
            review_notes.append(f"test failure: {diagnosis.category} — {diagnosis.next_action}")
        return IssueExecutionResult(plan, patches, ok, diagnosis, review_notes)
