from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from .patch_editor import PatchPlan
from .test_diagnosis import FailureDiagnosis, TestFailureDiagnoser


@dataclass
class IssueExecutionResult:
    plan: list[str]
    patches: list[PatchPlan]
    test_ok: bool
    diagnosis: FailureDiagnosis | None
    review_notes: list[str]
    attempts: int = 1
    stopped_reason: str = "completed"


Repairer = Callable[[str, list[str], list[PatchPlan], FailureDiagnosis], list[PatchPlan]]


class IssueExecutionLoop:
    """Bounded issue -> plan -> patch -> test -> diagnose -> repair -> review loop.

    External writes remain the caller's responsibility and must pass the normal
    tool permission/approval layer before being applied. Repeated identical
    failures stop the loop rather than burning attempts on the same state.
    """

    def __init__(self, max_attempts: int = 3) -> None:
        if not 1 <= int(max_attempts) <= 5:
            raise ValueError("max_attempts must be between 1 and 5")
        self.max_attempts = int(max_attempts)
        self.diagnoser = TestFailureDiagnoser()

    def run(
        self,
        issue: str,
        planner: Callable[[str], list[str]],
        patcher: Callable[[list[str]], list[PatchPlan]],
        tester: Callable[[list[PatchPlan]], tuple[bool, str]],
        reviewer: Callable[[str, list[PatchPlan]], list[str]],
        repairer: Repairer | None = None,
    ) -> IssueExecutionResult:
        plan = planner(issue)
        patches = patcher(plan)
        diagnosis: FailureDiagnosis | None = None
        seen_failures: set[str] = set()
        attempts = 0
        stopped_reason = "completed"
        ok = False

        while attempts < self.max_attempts:
            attempts += 1
            ok, log = tester(patches)
            if ok:
                diagnosis = None
                stopped_reason = "tests_passed"
                break

            diagnosis = self.diagnoser.diagnose(log)
            if diagnosis.fingerprint in seen_failures:
                stopped_reason = "repeated_failure"
                break
            seen_failures.add(diagnosis.fingerprint)

            if repairer is None:
                stopped_reason = "repairer_not_configured"
                break
            if attempts >= self.max_attempts:
                stopped_reason = "attempt_limit"
                break

            repaired = repairer(issue, plan, patches, diagnosis)
            if not repaired:
                stopped_reason = "no_safe_repair"
                break
            patches = repaired

        review_notes = reviewer(issue, patches)
        if not ok and diagnosis:
            review_notes.append(
                f"test failure: {diagnosis.category} — {diagnosis.next_action} "
                f"(fingerprint={diagnosis.fingerprint})"
            )
        review_notes.append(f"execution loop: attempts={attempts}, stop={stopped_reason}")
        return IssueExecutionResult(
            plan=plan,
            patches=patches,
            test_ok=ok,
            diagnosis=diagnosis,
            review_notes=review_notes,
            attempts=attempts,
            stopped_reason=stopped_reason,
        )
