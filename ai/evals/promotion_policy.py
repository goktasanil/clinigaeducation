from __future__ import annotations

import argparse
import json
from pathlib import Path


def quality(run: dict) -> float:
    if run.get("semantic_score") is not None:
        return float(run["semantic_score"])
    return float(run.get("contract_pass_rate", 0.0))


def decide(candidate: dict, baseline: dict, min_improvement: float = 0.01, max_latency_regression: float = 0.20) -> dict:
    cq, bq = quality(candidate), quality(baseline)
    cl = float(candidate.get("latency_ms_median") or 1e9)
    bl = float(baseline.get("latency_ms_median") or 1e9)
    quality_ok = cq >= bq + min_improvement
    latency_ok = cl <= bl * (1.0 + max_latency_regression)
    return {
        "promote": quality_ok and latency_ok,
        "candidate_quality": cq,
        "baseline_quality": bq,
        "quality_improvement": cq - bq,
        "candidate_latency_ms": cl,
        "baseline_latency_ms": bl,
        "quality_gate_passed": quality_ok,
        "latency_gate_passed": latency_ok,
        "policy": {
            "min_improvement": min_improvement,
            "max_latency_regression": max_latency_regression,
        },
    }


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("candidate")
    p.add_argument("baseline")
    p.add_argument("--min-improvement", type=float, default=0.01)
    p.add_argument("--max-latency-regression", type=float, default=0.20)
    p.add_argument("--out", default="ai/evals/results/promotion_decision.json")
    args = p.parse_args()
    candidate = json.loads(Path(args.candidate).read_text(encoding="utf-8"))
    baseline = json.loads(Path(args.baseline).read_text(encoding="utf-8"))
    result = decide(candidate, baseline, args.min_improvement, args.max_latency_regression)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
