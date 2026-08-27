from ai.runtime.agent_runtime import detect_capabilities
from ai.runtime.benchmark_profiles import benchmark_profile, post_generation_review


def test_coding_profile_activates_swebench_protocol():
    profile = benchmark_profile("Fix this GitHub repo issue and failing test")
    assert "localize" in profile
    assert "regression" in profile
    caps = detect_capabilities("Fix this repo bug", False, False)
    assert "repository_map" in caps
    assert "swebench_pro_protocol" in caps


def test_health_profile_activates_professional_review():
    profile = benchmark_profile("Summarize the latest clinical guideline for a drug")
    assert "authoritative dated sources" in profile
    caps = detect_capabilities("clinical guideline review", False, False)
    assert "professional_health_review" in caps


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
