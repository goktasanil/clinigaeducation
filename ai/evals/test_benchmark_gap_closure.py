from pathlib import Path

from ai.agents.repo_map import RankedFile, RepositoryMap
from ai.agents.swebench_pro import PatchCandidate, SWEIssueResolver
from ai.clinical.professional_answer_guard import ProfessionalHealthAnswerGuard


def test_repo_map_boosts_stack_trace_path(tmp_path):
    pkg = tmp_path / "pkg"
    pkg.mkdir()
    (pkg / "service.py").write_text("def calculate_total(x):\n    return x\n", encoding="utf-8")
    (pkg / "other.py").write_text("def helper():\n    return 1\n", encoding="utf-8")
    mapper = RepositoryMap(tmp_path).build()
    ranked = mapper.rank("total is wrong", "Traceback pkg/service.py:12 AssertionError")
    assert ranked
    assert ranked[0].path == "pkg/service.py"


def test_swe_resolver_backtracks_and_requires_regression():
    resolver = SWEIssueResolver(max_rounds=2, max_candidates_per_round=2)
    localized = [RankedFile("pkg/service.py", 10.0, ("issue-term overlap=2",))]
    bad = PatchCandidate("broad", ("pkg/service.py", "pkg/api.py"), "broad rewrite", 80, "high")
    good = PatchCandidate("minimal", ("pkg/service.py",), "fix boundary condition", 4, "low")

    def propose(_issue, _files, attempts):
        return [bad, good] if not attempts else [good]

    def focused(candidate):
        return (candidate.name == "minimal", "focused result")

    def regression(candidate):
        return (candidate.name == "minimal", "regression result")

    result = resolver.solve("boundary bug", localized, propose, focused, regression)
    assert result.solved is True
    assert result.selected == good
    assert all(item.ok for item in result.attempts[-1].evidence)


def test_professional_health_guard_penalizes_unsourced_absolute_claim():
    guard = ProfessionalHealthAnswerGuard()
    review = guard.review(
        "What is the latest guideline dose?",
        "This drug is completely safe and you should take 50 mg. This is definitely the current guideline.",
    )
    codes = {finding.code for finding in review.findings}
    assert review.requires_human_review is True
    assert "overconfidence" in codes
    assert "freshness_without_source" in codes
    assert "patient_specific_directive" in codes


def test_professional_health_guard_rewards_sourced_calibrated_scope():
    guard = ProfessionalHealthAnswerGuard()
    answer = (
        "Evidence may vary by indication and patient factors. For professional review, compare the current product label "
        "and applicable guideline before making a clinical decision; this summary is not a patient-specific prescription."
    )
    review = guard.review("Summarize the evidence for professional review.", answer, citations=["Authority guideline 2026"])
    assert review.score >= 90
