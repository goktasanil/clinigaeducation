from __future__ import annotations

from pathlib import Path

from ai.agents.repo_map import RepositoryMap
from ai.clinical.professional_answer_guard import ProfessionalHealthAnswerGuard

from .registry import Skill, registry

_ALLOWED_ROOT = Path.cwd().resolve()


def _authorized_dir(path: str) -> Path:
    target = (Path.cwd() / path).resolve()
    if target != _ALLOWED_ROOT and _ALLOWED_ROOT not in target.parents:
        raise PermissionError("Repository analysis is limited to the authorized local workspace")
    if not target.is_dir():
        raise ValueError("Repository analysis target must be a local directory")
    return target


def localize_issue(issue: str, path: str = ".", failure_log: str = "", limit: int = 12) -> dict:
    target = _authorized_dir(path)
    mapper = RepositoryMap(target).build()
    ranked = mapper.rank(issue, failure_log=failure_log, limit=min(max(1, limit), 30))
    return {
        "target": str(target),
        "ranked_files": [{"path": item.path, "score": item.score, "reasons": list(item.reasons)} for item in ranked],
        "repo_map": mapper.render(ranked),
        "mode": "read-only-localization",
    }


def review_professional_health_answer(question: str, answer: str, citations: list[str] | None = None) -> dict:
    review = ProfessionalHealthAnswerGuard().review(question, answer, citations=citations)
    return {
        "score": review.score,
        "requires_human_review": review.requires_human_review,
        "findings": [finding.__dict__ for finding in review.findings],
        "mode": "quality-review-not-medical-advice",
    }


registry.register(Skill(name="engineering.localize_issue", description="Rank local repository files and symbols for a real software issue using a compact repository map.", handler=localize_issue))
registry.register(Skill(name="clinical.review_professional_answer", description="Review a professional health-domain draft for evidence sourcing, calibrated certainty and safe scope.", handler=review_professional_health_answer))
