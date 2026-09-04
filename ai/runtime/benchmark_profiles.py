from __future__ import annotations

from ai.clinical.professional_answer_guard import ProfessionalHealthAnswerGuard

_CODE_TERMS = ("code", "python", "typescript", "bug", "repo", "issue", "test failure", "kod", "hata", "github")
_HEALTH_TERMS = ("clinical", "medical", "health", "patient", "drug", "dose", "guideline", "trial", "klinik", "tıbbi", "hasta", "ilaç", "doz")


def benchmark_profile(task: str) -> str:
    text = task.lower()
    blocks: list[str] = []
    if any(term in text for term in _CODE_TERMS):
        blocks.append(
            "Software issue protocol: reproduce or identify the failing behavior before editing; localize the smallest relevant code surface; "
            "form multiple plausible root-cause hypotheses when evidence is ambiguous; prefer the smallest coherent patch; run focused tests first; "
            "run regression tests before declaring success; if a candidate fails, use the failure as evidence and do not repeat the same patch."
        )
    if any(term in text for term in _HEALTH_TERMS):
        blocks.append(
            "Professional health protocol: distinguish evidence from inference; qualify uncertainty; attach authoritative dated sources to current guideline, "
            "label, approval or treatment claims; do not convert general information into patient-specific diagnosis or prescribing; flag high-risk content for human review."
        )
    return "\n".join(blocks)


def post_generation_review(task: str, answer: str) -> dict | None:
    text = task.lower()
    if not any(term in text for term in _HEALTH_TERMS):
        return None
    review = ProfessionalHealthAnswerGuard().review(task, answer)
    return {
        "score": review.score,
        "requires_human_review": review.requires_human_review,
        "findings": [finding.__dict__ for finding in review.findings],
        "benchmark_profile": "HealthBench Professional gap-closure scaffold",
    }
