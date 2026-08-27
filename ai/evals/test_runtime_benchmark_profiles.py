from pathlib import Path

from ai.runtime.benchmark_profiles import benchmark_profile, post_generation_review


def test_coding_profile_activates_swebench_protocol():
    profile = benchmark_profile("Fix this GitHub repo issue and failing test")
    assert "localize" in profile
    assert "regression" in profile


def test_health_profile_activates_professional_review():
    profile = benchmark_profile("Summarize the latest clinical guideline for a drug")
    assert "authoritative dated sources" in profile


def test_runtime_wires_benchmark_profiles_without_importing_heavy_optional_dependencies():
    source = Path("ai/runtime/agent_runtime.py").read_text(encoding="utf-8")
    assert "benchmark_profile(task)" in source
    assert "post_generation_review(task, text)" in source
    assert '"repository_map"' in source
    assert '"swebench_pro_protocol"' in source
    assert '"professional_health_review"' in source


def test_health_post_generation_review_is_attached():
    review = post_generation_review(
        "What is the latest guideline dose?",
        "This is definitely the current guideline and you should take 50 mg.",
    )
    assert review is not None
    assert review["requires_human_review"] is True
    assert review["benchmark_profile"].startswith("HealthBench Professional")


def test_non_health_answer_does_not_get_health_review():
    assert post_generation_review("Explain a Python function", "It returns a list.") is None
