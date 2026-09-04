from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from ai.rag.cross_encoder_reranker import CrossEncoderReranker
from ai.rag.vector_router import DataSensitivity, VectorDatabaseRouter


@dataclass(frozen=True)
class Citation:
    index: int
    source: str
    text: str
    score: float


def rewrite_query(query: str) -> list[str]:
    base = " ".join(query.split())
    variants = [base]
    lower = base.lower()
    if "latest" in lower or "güncel" in lower:
        variants.append(f"{base} current official source")
    if "compare" in lower or "karşılaştır" in lower:
        variants.append(f"{base} differences evidence")
    if "how" in lower or "nasıl" in lower:
        variants.append(f"{base} steps requirements")
    return list(dict.fromkeys(variants))[:3]


def _dedupe(rows: Iterable[dict]) -> list[dict]:
    seen = set()
    out = []
    for row in rows:
        key = (row.get("source"), row.get("text"))
        if key in seen:
            continue
        seen.add(key)
        out.append(row)
    return out


def contextual_compress(query: str, rows: list[dict], max_chars: int = 7000) -> list[dict]:
    selected = []
    used = 0
    for row in rows:
        text = row.get("text", "").strip()
        if not text:
            continue
        remaining = max_chars - used
        if remaining <= 0:
            break
        if len(text) > remaining:
            text = text[:remaining]
        selected.append({**row, "text": text})
        used += len(text)
    return selected


def retrieve(
    query: str,
    tenant_id: str,
    limit: int = 8,
    *,
    sensitivity: DataSensitivity = DataSensitivity.INTERNAL,
) -> tuple[list[dict], list[Citation]]:
    router = VectorDatabaseRouter.from_environment()
    candidates = []
    for variant in rewrite_query(query):
        candidates.extend(
            router.search(variant, limit=limit, tenant_id=tenant_id, sensitivity=sensitivity)
        )
    candidates = _dedupe(candidates)
    reranked = CrossEncoderReranker().rerank(query, candidates, top_k=limit)
    compressed = contextual_compress(query, reranked)
    citations = [
        Citation(
            i + 1,
            row.get("source", "unknown"),
            row.get("text", ""),
            float(row.get("rerank_score", row.get("score", 0.0))),
        )
        for i, row in enumerate(compressed)
    ]
    return compressed, citations

