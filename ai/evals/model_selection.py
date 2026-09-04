from __future__ import annotations

import argparse
import json
from pathlib import Path


def score(run: dict, *, latency_weight: float = 0.15) -> float:
    quality = float(run.get("semantic_score") or run.get("contract_pass_rate") or 0.0)
    latency = float(run.get("latency_ms_median") or 1e9)
    latency_term = 1.0 / (1.0 + latency / 1000.0)
    return quality * (1.0 - latency_weight) + latency_term * latency_weight


def rank(paths: list[str]) -> list[dict]:
    rows = []
    for path in paths:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        rows.append({
            "provider": data.get("provider"),
            "model": data.get("model"),
            "score": score(data),
            "quality": data.get("semantic_score") if data.get("semantic_score") is not None else data.get("contract_pass_rate"),
            "latency_ms_median": data.get("latency_ms_median"),
            "source": path,
        })
    return sorted(rows, key=lambda x: x["score"], reverse=True)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("runs", nargs="+")
    p.add_argument("--out", default="ai/evals/results/leaderboard.json")
    args = p.parse_args()
    board = rank(args.runs)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(board, indent=2), encoding="utf-8")
    print(json.dumps(board, indent=2))


if __name__ == "__main__":
    main()
