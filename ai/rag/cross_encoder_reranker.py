from __future__ import annotations

import os
from typing import Iterable

from sentence_transformers import CrossEncoder

MODEL_NAME = os.getenv("CLINIGA_RERANK_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")


class CrossEncoderReranker:
    def __init__(self, model_name: str = MODEL_NAME) -> None:
        self.model = CrossEncoder(model_name)

    def rerank(self, query: str, docs: Iterable[dict], top_k: int = 6) -> list[dict]:
        items = list(docs)
        if not items:
            return []
        pairs = [(query, str(item.get("text", ""))) for item in items]
        scores = self.model.predict(pairs)
        ranked = []
        for item, score in zip(items, scores):
            enriched = dict(item)
            enriched["rerank_score"] = float(score)
            ranked.append(enriched)
        ranked.sort(key=lambda x: x["rerank_score"], reverse=True)
        return ranked[:top_k]
