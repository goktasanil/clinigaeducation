from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from typing import Callable, Iterable

from .repo_map import RankedFile


@dataclass(frozen=True)
class PatchCandidate:
    name: str
    touched_files: tuple[str, ...]
    summary: str
    changed_lines: int = 0
    risk: str = "medium"

    @property
    def fingerprint(self) -> str:
        payload = "|".join([self.name, *self.touched_files, self.summary])
        return hashlib.sha256(payload.encode()).hexdigest()[:16]


@dataclass(frozen=True)
class ValidationEvidence:
    stage: str
    ok: bool
    log: str


@dataclass
class ResolutionAttempt:
    candidate: PatchCandidate
    evidence: list[ValidationEvidence] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return bool(self.evidence) and all(item.ok for item in self.evidence)


@dataclass
class ResolutionResult:
    solved: bool
    selected: PatchCandidate | None
    attempts: list[ResolutionAttempt]
    localized_files: list[RankedFile]
    notes: list[str]


class SWEIssueResolver:
    """Evidence-driven issue -> localize -> patch -> test -> backtrack scaffold.

    This is intentionally executor-agnostic. The host provides candidate generation
    and test callbacks, so shell/tool permissions remain enforced by the normal
    runtime. A candidate is accepted only after focused and regression validation.
    """

    def __init__(self, max_rounds: int = 4, max_candidates_per_round: int = 3) -> None:
        self.max_rounds = max(1, max_rounds)
        self.max_candidates_per_round = max(1, max_candidates_per_round)

    def solve(
        self,
        issue: str,
        localized_files: list[RankedFile],
        propose: Callable[[str, list[RankedFile], list[ResolutionAttempt]], Iterable[PatchCandidate]],
        validate_focused: Callable[[PatchCandidate], tuple[bool, str]],
        validate_regression: Callable[[PatchCandidate], tuple[bool, str]],
    ) -> ResolutionResult:
        attempts: list[ResolutionAttempt] = []
        seen: set[str] = set()
        notes = [
            "localize before editing",
            "prefer minimal coherent patches",
            "require focused reproduction/test evidence",
            "require regression evidence before acceptance",
            "do not repeat previously failed candidate fingerprints",
        ]
        for _round in range(self.max_rounds):
            candidates = list(propose(issue, localized_files, attempts))[: self.max_candidates_per_round]
            fresh = [candidate for candidate in candidates if candidate.fingerprint not in seen]
            if not fresh:
                notes.append("candidate generator produced no new patch hypothesis")
                break
            fresh.sort(key=self._candidate_cost)
            for candidate in fresh:
                seen.add(candidate.fingerprint)
                attempt = ResolutionAttempt(candidate)
                ok, log = validate_focused(candidate)
                attempt.evidence.append(ValidationEvidence("focused", ok, log[-6000:]))
                attempts.append(attempt)
                if not ok:
                    continue
                regression_ok, regression_log = validate_regression(candidate)
                attempt.evidence.append(ValidationEvidence("regression", regression_ok, regression_log[-6000:]))
                if regression_ok:
                    notes.append("accepted candidate after focused + regression validation")
                    return ResolutionResult(True, candidate, attempts, localized_files, notes)
        notes.append("no candidate satisfied both focused and regression validation")
        return ResolutionResult(False, None, attempts, localized_files, notes)

    @staticmethod
    def _candidate_cost(candidate: PatchCandidate) -> tuple[int, int, int, str]:
        risk_weight = {"low": 0, "medium": 1, "high": 2}.get(candidate.risk.lower(), 2)
        return risk_weight, len(candidate.touched_files), candidate.changed_lines, candidate.name
