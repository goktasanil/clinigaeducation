from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from ai.ingestion.parsers import parse_document
from ai.rag.qdrant_store import KnowledgeStore

SUPPORTED = {".txt", ".md", ".rst", ".json", ".csv", ".pdf", ".docx"}


@dataclass(frozen=True)
class Chunk:
    id: str
    text: str
    source: str
    metadata: dict


def chunk_text(text: str, source: str, chunk_size: int = 1200, overlap: int = 180) -> list[Chunk]:
    text = text.strip()
    if not text:
        return []
    if not 200 <= int(chunk_size) <= 20_000:
        raise ValueError("chunk_size out of bounds")
    if not 0 <= int(overlap) < int(chunk_size):
        raise ValueError("overlap must be non-negative and smaller than chunk_size")
    chunks: list[Chunk] = []
    step = max(1, chunk_size - overlap)
    for start in range(0, len(text), step):
        piece = text[start : start + chunk_size].strip()
        if not piece:
            continue
        digest = hashlib.sha256(f"{source}:{start}:{piece}".encode()).hexdigest()[:24]
        chunks.append(Chunk(digest, piece, source, {"offset": start}))
    return chunks


def load_text_file(path: Path) -> str:
    resolved = path.resolve()
    if resolved.suffix.lower() not in SUPPORTED:
        raise ValueError(f"Unsupported file type: {resolved.suffix}")
    return parse_document(str(resolved))


def _tenant_point_id(tenant_id: str, chunk_id: str) -> str:
    if not tenant_id or len(tenant_id) > 200:
        raise ValueError("tenant_id is required and must be <= 200 characters")
    return hashlib.sha256(f"{tenant_id}:{chunk_id}".encode()).hexdigest()[:32]


def _store_chunks(chunks: Iterable[Chunk], tenant_id: str) -> int:
    docs = [
        {
            "id": _tenant_point_id(tenant_id, chunk.id),
            "text": chunk.text,
            "source": chunk.source,
            "metadata": {**chunk.metadata, "tenant_id": tenant_id},
        }
        for chunk in chunks
    ]
    if not docs:
        return 0
    KnowledgeStore().add(docs)
    return len(docs)


def ingest_documents(documents: Iterable[dict], tenant_id: str) -> int:
    chunks: list[Chunk] = []
    for doc in documents:
        text = str(doc.get("text", ""))
        source = str(doc.get("source", "inline")).strip()[:500] or "inline"
        chunks.extend(chunk_text(text, source))
    return _store_chunks(chunks, tenant_id)


def ingest_paths(paths: Iterable[str], tenant_id: str) -> int:
    chunks: list[Chunk] = []
    for raw in paths:
        path = Path(raw)
        chunks.extend(chunk_text(load_text_file(path), str(path.resolve())))
    return _store_chunks(chunks, tenant_id)
