from __future__ import annotations

import asyncio
import os
import re
from dataclasses import dataclass
from typing import Any, Awaitable, Callable

from .registry import Skill, registry

_SOURCE_RE = re.compile(r"^[A-Za-z0-9_.:-]{1,80}$")


@dataclass(frozen=True)
class SearchQuery:
    query: str
    source: str


def _approved_sources() -> set[str]:
    configured = {
        item.strip().lower()
        for item in os.getenv(
            "CLINIGA_SEARCH_ALLOWED_SOURCES",
            "official,pubmed,clinicaltrials,scholar,web",
        ).split(",")
        if item.strip()
    }
    return configured


def _validate_query(item: SearchQuery) -> SearchQuery:
    query = str(item.query or "").strip()
    source = str(item.source or "").strip().lower()
    if not query or len(query) > 2000:
        raise ValueError("search query must be between 1 and 2000 characters")
    if not _SOURCE_RE.fullmatch(source):
        raise ValueError("invalid search source name")
    if source not in _approved_sources():
        raise PermissionError(f"search source is not approved: {source}")
    return SearchQuery(query=query, source=source)


async def parallel_search(
    queries: list[SearchQuery],
    search_fn: Callable[[SearchQuery], Awaitable[Any]],
    max_concurrency: int = 6,
):
    """Run bounded research concurrently across explicitly approved sources."""
    if not 1 <= len(queries) <= 32:
        raise ValueError("parallel search requires between 1 and 32 queries")
    validated = [_validate_query(item) for item in queries]
    semaphore = asyncio.Semaphore(max(1, min(int(max_concurrency), 8)))

    async def run_one(item: SearchQuery):
        async with semaphore:
            try:
                return {"ok": True, "data": await search_fn(item)}
            except Exception as exc:
                # Do not serialize exception messages because upstream clients may
                # include URLs, tokens, or response fragments in them.
                return {"ok": False, "error_type": type(exc).__name__}

    results = await asyncio.gather(*(run_one(q) for q in validated))
    return [
        {"query": q.query, "source": q.source, **result}
        for q, result in zip(validated, results)
    ]


registry.register(
    Skill(
        name="research.parallel_search",
        description="Search bounded approved sources concurrently without bypassing network policy.",
        handler=parallel_search,
    )
)
