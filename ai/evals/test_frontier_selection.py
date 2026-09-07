from ai.evals.model_selection import score
from ai.evals.promotion_policy import decide


def test_score_rewards_quality_and_latency():
    fast_good = {"contract_pass_rate": 1.0, "latency_ms_median": 500}
    slow_good = {"contract_pass_rate": 1.0, "latency_ms_median": 5000}
    assert score(fast_good) > score(slow_good)


def test_promotion_requires_quality_gain_and_latency_gate():
    baseline = {"semantic_score": 0.70, "latency_ms_median": 1000}
    candidate = {"semantic_score": 0.73, "latency_ms_median": 1100}
    result = decide(candidate, baseline, min_improvement=0.01, max_latency_regression=0.20)
    assert result["promote"] is True

    too_slow = {"semantic_score": 0.80, "latency_ms_median": 1500}
    assert decide(too_slow, baseline, 0.01, 0.20)["promote"] is False


def test_contract_only_score_is_not_mislabeled_semantic():
    run = {"contract_pass_rate": 0.8, "semantic_score": None, "latency_ms_median": 800}
    assert 0 < score(run) < 1
