from __future__ import annotations

import argparse
import concurrent.futures
import os
import statistics
import time

import httpx


def one_request(base_url: str, tenant: str, api_key: str, timeout: float) -> tuple[int, float]:
    start = time.perf_counter()
    response = httpx.get(f"{base_url.rstrip('/')}/health", headers={"X-Tenant-ID": tenant, "X-API-Key": api_key}, timeout=timeout)
    return response.status_code, time.perf_counter() - start


def main() -> int:
    parser = argparse.ArgumentParser(description="Load test a live CliniGA AI deployment")
    parser.add_argument("--base-url", default=os.getenv("CLINIGA_LOAD_BASE_URL", "http://localhost:8000"))
    parser.add_argument("--tenant", default=os.getenv("CLINIGA_LOAD_TENANT", "load-test"))
    parser.add_argument("--api-key", default=os.getenv("CLINIGA_LOAD_API_KEY", "load-test"))
    parser.add_argument("--requests", type=int, default=200)
    parser.add_argument("--concurrency", type=int, default=20)
    parser.add_argument("--timeout", type=float, default=10.0)
    args = parser.parse_args()
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        futures = [pool.submit(one_request, args.base_url, args.tenant, args.api_key, args.timeout) for _ in range(args.requests)]
        results = [future.result() for future in futures]
    statuses = [status for status, _ in results]
    latencies = sorted(latency for _, latency in results)
    p95_index = max(0, min(len(latencies) - 1, int(len(latencies) * 0.95) - 1))
    print({"requests": len(results), "success_2xx": sum(200 <= status < 300 for status in statuses), "mean_ms": round(statistics.mean(latencies) * 1000, 2), "p95_ms": round(latencies[p95_index] * 1000, 2), "max_ms": round(max(latencies) * 1000, 2)})
    return 0 if all(200 <= status < 500 for status in statuses) else 1


if __name__ == "__main__":
    raise SystemExit(main())
