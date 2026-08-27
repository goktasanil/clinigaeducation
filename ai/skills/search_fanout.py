from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Awaitable, Callable, Any

from .registry import Skill, registry


@dataclass(frozen=True)
class SearchQuery:
    query: str
    source: str


async def parallel_search(
    queries: list[SearchQuery],
    search_fn: Callable[[SearchQuery], Awaitable[Any]],
    max_concurrency: int = 6,
):
    """Run broad research concurrently across approved sources only."""
    semaphore = asyncio.Semaphore(max(1, min(max_concurrency, 12)))

    async def run_one(item: SearchQuery):
        async with semaphore:
            return await search_fn(item)

    results = await asyncio.gather(*(run_one(q) for q in queries), return_exceptions=True)
    return [
        {"query": q.query, "source": q.source, "result": r}
        for q, r in zip(queries, results)
    ]


registry.register(Skill(
    name="research.parallel_search",
    description="Search many approved sources concurrently without bypassing network policy.",
    handler=parallel_search,
))
