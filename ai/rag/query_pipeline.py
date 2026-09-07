from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from ai.rag.cross_encoder_reranker import CrossEncoderReranker
from ai.rag.qdrant_store import KnowledgeStore


@dataclass(frozen=True)
class Citation:
    index: int
    source: str
    text: str
    score: float


def rewrite_query(query: str) -> list[str]:
    base = " ".join(str(query or "").split())[:5000]
    if not base:
        raise ValueError("query is required")
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
        source = str(row.get("source") or "").strip()
        text = str(row.get("text") or "").strip()
        if not source or source.lower() == "unknown" or not text:
            continue
        key = (source, text)
        if key in seen:
            continue
        seen.add(key)
        out.append({**row, "source": source, "text": text})
    return out


def contextual_compress(query: str, rows: list[dict], max_chars: int = 7000) -> list[dict]:
    del query  # compression is deterministic; relevance already comes from reranking.
    if not 500 <= int(max_chars) <= 50_000:
        raise ValueError("max_chars out of bounds")
    selected = []
    used = 0
    for row in rows:
        text = str(row.get("text") or "").strip()
        source = str(row.get("source") or "").strip()
        if not text or not source or source.lower() == "unknown":
            continue
        remaining = max_chars - used
        if remaining <= 0:
            break
        if len(text) > remaining:
            text = text[:remaining].rstrip()
        if not text:
            break
        selected.append({**row, "source": source, "text": text})
        used += len(text)
    return selected


def retrieve(query: str, tenant_id: str, limit: int = 8) -> tuple[list[dict], list[Citation]]:
    tenant = str(tenant_id or "").strip()
    if not tenant:
        raise ValueError("tenant_id is required")
    limit = max(1, min(int(limit), 20))
    store = KnowledgeStore()
    candidates = []
    for variant in rewrite_query(query):
        candidates.extend(store.search(variant, limit=limit, tenant_id=tenant))
    candidates = _dedupe(candidates)
    if not candidates:
        return [], []

    reranked = CrossEncoderReranker().rerank(query, candidates, top_k=limit)
    compressed = contextual_compress(query, reranked)
    grounded_rows: list[dict] = []
    citations: list[Citation] = []
    for row in compressed:
        source = str(row["source"])
        text = str(row["text"])
        score = float(row.get("rerank_score", row.get("score", 0.0)))
        index = len(citations) + 1
        citations.append(Citation(index, source, text, score))
        grounded_rows.append({**row, "citation_index": index})
    return grounded_rows, citations
