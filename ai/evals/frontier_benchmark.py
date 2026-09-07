from __future__ import annotations

import argparse
import asyncio
import json
import os
import statistics
import time
from dataclasses import asdict, dataclass
from pathlib import Path

import httpx


@dataclass
class CaseResult:
    case_id: str
    provider: str
    model: str
    latency_ms: float
    answer_chars: int
    passed_contract: bool
    error: str | None = None


def load_cases(path: str) -> list[dict]:
    rows = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                row = json.loads(line)
                if not {"id", "task", "checks"} <= set(row):
                    raise ValueError(f"Invalid benchmark case: {row}")
                rows.append(row)
    if not rows:
        raise ValueError("Benchmark set is empty")
    return rows


async def call_openai_compatible(base_url: str, api_key: str, model: str, prompt: str, timeout: float) -> str:
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(
            f"{base_url.rstrip('/')}/chat/completions",
            headers=headers,
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are being benchmarked. Follow the task exactly; do not claim tools or evidence you did not receive."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0,
            },
        )
        r.raise_for_status()
        data = r.json()
        return str(data["choices"][0]["message"]["content"])


def contract_check(answer: str) -> bool:
    # Deliberately conservative structural gate. Semantic judging belongs to an
    # external evaluator such as lm-eval/DeepEval/Ragas and is never fabricated.
    text = answer.strip()
    return bool(text) and len(text) >= 20 and "i cannot access the internet" not in text.lower()


async def run_one(case: dict, provider: str, model: str, base_url: str, api_key: str, timeout: float) -> CaseResult:
    started = time.perf_counter()
    try:
        answer = await call_openai_compatible(base_url, api_key, model, case["task"], timeout)
        elapsed = (time.perf_counter() - started) * 1000
        return CaseResult(case["id"], provider, model, elapsed, len(answer), contract_check(answer))
    except Exception as exc:
        elapsed = (time.perf_counter() - started) * 1000
        return CaseResult(case["id"], provider, model, elapsed, 0, False, type(exc).__name__)


async def run(args) -> dict:
    cases = load_cases(args.cases)
    results = []
    for case in cases:
        results.append(await run_one(case, args.provider, args.model, args.base_url, args.api_key, args.timeout))

    passed = sum(1 for r in results if r.passed_contract)
    latencies = [r.latency_ms for r in results]
    summary = {
        "provider": args.provider,
        "model": args.model,
        "cases": len(results),
        "contract_pass_rate": passed / len(results),
        "latency_ms_median": statistics.median(latencies),
        "latency_ms_p95_approx": sorted(latencies)[max(0, int(len(latencies) * 0.95) - 1)],
        "results": [asdict(r) for r in results],
        "semantic_score": None,
        "semantic_score_note": "Run lm-evaluation-harness/DeepEval/Ragas for semantic quality; this harness does not invent benchmark scores.",
    }
    return summary


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--cases", default="ai/evals/benchmark.jsonl")
    p.add_argument("--provider", default=os.getenv("CLINIGA_BENCH_PROVIDER", "local"))
    p.add_argument("--model", default=os.getenv("CLINIGA_BENCH_MODEL", "Qwen/Qwen3-8B"))
    p.add_argument("--base-url", default=os.getenv("CLINIGA_BENCH_URL", "http://localhost:8001/v1"))
    p.add_argument("--api-key", default=os.getenv("CLINIGA_BENCH_API_KEY", ""))
    p.add_argument("--timeout", type=float, default=120.0)
    p.add_argument("--out", default="ai/evals/results/frontier.json")
    args = p.parse_args()
    summary = asyncio.run(run(args))
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in summary.items() if k != "results"}, indent=2))


if __name__ == "__main__":
    main()
