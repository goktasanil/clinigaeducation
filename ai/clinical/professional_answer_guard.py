from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class ReviewFinding:
    code: str
    severity: str
    message: str


@dataclass(frozen=True)
class ProfessionalAnswerReview:
    score: int
    requires_human_review: bool
    findings: tuple[ReviewFinding, ...]


class ProfessionalHealthAnswerGuard:
    """Quality/safety reviewer for professional health-domain answers.

    The reviewer does not diagnose or prescribe. It checks whether a drafted
    answer is appropriately sourced, calibrated and scoped for professional use.
    """

    HIGH_RISK = re.compile(
        r"\b(dose|dosage|mg\b|prescrib|diagnos|contraindicat|stop taking|start taking|emergency|suicid|anaphyl|chest pain|stroke)\w*",
        re.I,
    )
    ABSOLUTE = re.compile(r"\b(always|never|guaranteed|definitely|100%|no risk|completely safe)\b", re.I)
    FRESHNESS = re.compile(r"\b(latest|current|most recent|guideline|approval|label|recommendation)\b", re.I)
    SOURCE_MARKER = re.compile(r"(https?://|doi:|pmid|\[[0-9]+\]|\([A-Za-z][^)]*20\d{2}\))", re.I)
    UNCERTAINTY = re.compile(r"\b(may|might|can|depends|uncertain|evidence|limited|varies|consider)\b", re.I)

    def review(self, question: str, answer: str, citations: list[str] | None = None) -> ProfessionalAnswerReview:
        citations = citations or []
        findings: list[ReviewFinding] = []
        high_risk = bool(self.HIGH_RISK.search(question + "\n" + answer))
        if self.ABSOLUTE.search(answer):
            findings.append(ReviewFinding("overconfidence", "high", "Avoid absolute clinical claims; calibrate certainty to the evidence."))
        if self.FRESHNESS.search(answer) and not (citations or self.SOURCE_MARKER.search(answer)):
            findings.append(ReviewFinding("freshness_without_source", "high", "Current/guideline/approval claims need a dated authoritative source."))
        if high_risk and not (citations or self.SOURCE_MARKER.search(answer)):
            findings.append(ReviewFinding("high_risk_unsourced", "high", "High-risk health claims should be supported by authoritative evidence."))
        if high_risk and not self.UNCERTAINTY.search(answer):
            findings.append(ReviewFinding("missing_calibration", "medium", "High-risk answers should state uncertainty, dependencies or evidence limits."))
        if re.search(r"\byou (have|should take|should stop|need to take)\b", answer, re.I):
            findings.append(ReviewFinding("patient_specific_directive", "high", "Do not turn general information into patient-specific diagnosis or prescribing."))
        if len(answer.strip()) < 80:
            findings.append(ReviewFinding("insufficient_context", "low", "Professional health answers should include enough context to support interpretation."))

        penalty = sum({"low": 5, "medium": 12, "high": 25}[finding.severity] for finding in findings)
        score = max(0, 100 - penalty)
        requires_human_review = high_risk or any(f.severity == "high" for f in findings)
        return ProfessionalAnswerReview(score, requires_human_review, tuple(findings))
