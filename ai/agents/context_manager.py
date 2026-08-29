from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from typing import Iterable

_TOKEN_RE = re.compile(r"[\w.-]{2,}", re.UNICODE)


@dataclass(frozen=True)
class ContextItem:
    key: str
    text: str
    priority: int = 0
    group: str = "general"


class HierarchicalContextManager:
    """Build bounded, deduplicated context from summaries then details.

    The manager remains tokenizer-independent but supports an approximate token
    ceiling (four UTF-8 characters per token) in addition to a hard char limit.
    Optional query overlap improves relevance without allowing low-priority bulk
    context to crowd out summaries.
    """

    def __init__(
        self,
        max_chars: int = 120_000,
        *,
        max_tokens: int = 30_000,
        max_items_per_group: int = 40,
    ) -> None:
        if not 1_000 <= int(max_chars) <= 500_000:
            raise ValueError("max_chars out of bounds")
        if not 256 <= int(max_tokens) <= 128_000:
            raise ValueError("max_tokens out of bounds")
        self.max_chars = int(max_chars)
        self.max_tokens = int(max_tokens)
        self.max_items_per_group = max(1, min(int(max_items_per_group), 200))

    @staticmethod
    def _terms(text: str) -> set[str]:
        return {token.lower() for token in _TOKEN_RE.findall(text)}

    def _rank(self, item: ContextItem, query_terms: set[str], summary: bool) -> tuple:
        overlap = len(self._terms(item.key + " " + item.group + " " + item.text[:4000]) & query_terms)
        return (1 if summary else 0, item.priority, overlap, -len(item.text))

    def build(
        self,
        summaries: Iterable[ContextItem],
        details: Iterable[ContextItem],
        *,
        query: str = "",
    ) -> str:
        query_terms = self._terms(query)
        ranked: list[tuple[ContextItem, bool]] = [
            *((item, True) for item in summaries),
            *((item, False) for item in details),
        ]
        ranked.sort(
            key=lambda pair: self._rank(pair[0], query_terms, pair[1]),
            reverse=True,
        )

        out: list[str] = []
        used_chars = 0
        estimated_tokens = 0
        seen_hashes: set[str] = set()
        per_group: dict[str, int] = {}
        char_ceiling = min(self.max_chars, self.max_tokens * 4)

        for item, _summary in ranked:
            text = str(item.text or "").strip()
            if not text:
                continue
            digest = hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()
            if digest in seen_hashes:
                continue
            group = str(item.group or "general")[:100]
            if per_group.get(group, 0) >= self.max_items_per_group:
                continue
            key = str(item.key or "context")[:300]
            block = f"[{group}:{key}]\n{text}\n"
            block_chars = len(block)
            block_tokens = max(1, (block_chars + 3) // 4)
            if used_chars + block_chars > char_ceiling:
                continue
            if estimated_tokens + block_tokens > self.max_tokens:
                continue
            out.append(block)
            used_chars += block_chars
            estimated_tokens += block_tokens
            seen_hashes.add(digest)
            per_group[group] = per_group.get(group, 0) + 1
        return "\n".join(out)
