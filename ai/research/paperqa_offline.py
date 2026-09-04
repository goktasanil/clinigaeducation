from __future__ import annotations

import inspect
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Awaitable, Callable, Mapping, Sequence

_TENANT = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{0,199}$")
_SOURCE_SUFFIXES = {".pdf", ".txt", ".md", ".docx"}


@dataclass(frozen=True)
class EvidenceAnswer:
    answer: str
    citations: tuple[str, ...]
    sources: tuple[str, ...]
    requires_human_review: bool


class OfflinePaperQAGateway:
    """A network-denying contract for an independently configured PaperQA runner."""

    def __init__(
        self,
        source_root: str | Path,
        query_runner: Callable[..., Mapping[str, Any] | Awaitable[Mapping[str, Any]]],
        *,
        max_sources: int = 100,
    ) -> None:
        self.source_root = Path(source_root).resolve()
        self.query_runner = query_runner
        self.max_sources = max_sources

    def _sources(self, sources: Sequence[str | Path]) -> tuple[str, ...]:
        if not sources or len(sources) > self.max_sources:
            raise ValueError("source count is outside the allowed range")
        approved: list[str] = []
        for source in sources:
            raw = str(source)
            if "://" in raw or raw.startswith(("data:", "file:")):
                raise PermissionError("remote scientific sources are disabled")
            candidate = (self.source_root / source).resolve() if not Path(source).is_absolute() else Path(source).resolve()
            if not candidate.is_relative_to(self.source_root):
                raise PermissionError("scientific source escapes the approved root")
            if not candidate.is_file() or candidate.suffix.lower() not in _SOURCE_SUFFIXES:
                raise ValueError("scientific source is missing or not allowlisted")
            approved.append(str(candidate))
        return tuple(approved)

    async def ask(
        self,
        query: str,
        *,
        tenant_id: str,
        sources: Sequence[str | Path],
    ) -> EvidenceAnswer:
        if not _TENANT.fullmatch(tenant_id):
            raise ValueError("invalid tenant_id")
        if not query.strip() or len(query) > 5000:
            raise ValueError("query is empty or too long")
        approved = self._sources(sources)
        result = self.query_runner(
            query=query,
            sources=list(approved),
            tenant_id=tenant_id,
            allow_network=False,
            metadata_lookup=False,
        )
        if inspect.isawaitable(result):
            result = await result
        if not isinstance(result, Mapping):
            raise TypeError("PaperQA runner must return a mapping")
        answer = str(result.get("answer", "")).strip()
        citations = tuple(str(item).strip() for item in result.get("citations", ()) if str(item).strip())
        if not answer:
            raise ValueError("PaperQA runner returned no answer")
        return EvidenceAnswer(
            answer=answer,
            citations=citations,
            sources=tuple(str(Path(item).relative_to(self.source_root)) for item in approved),
            requires_human_review=not citations,
        )
