from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass
class Candidate:
    text: str
    source: str
    dense_score: float = 0.0
    lexical_score: float = 0.0
    rerank_score: float = 0.0

    @property
    def fused_score(self) -> float:
        return 0.65 * self.dense_score + 0.25 * self.lexical_score + 0.10 * self.rerank_score


def reciprocal_rank_fusion(rankings: Iterable[list[Candidate]], k: int = 60) -> list[Candidate]:
    scores: dict[tuple[str, str], float] = {}
    items: dict[tuple[str, str], Candidate] = {}
    for ranking in rankings:
        for rank, item in enumerate(ranking, start=1):
            key = (item.source, item.text)
            items[key] = item
            scores[key] = scores.get(key, 0.0) + 1.0 / (k + rank)
    ordered = sorted(items.values(), key=lambda c: scores[(c.source, c.text)], reverse=True)
    return ordered


def rerank(query: str, candidates: list[Candidate], top_k: int = 5) -> list[Candidate]:
    q_terms = set(query.lower().split())
    for item in candidates:
        terms = set(item.text.lower().split())
        item.rerank_score = len(q_terms & terms) / max(len(q_terms), 1)
    return sorted(candidates, key=lambda c: c.fused_score, reverse=True)[:top_k]
