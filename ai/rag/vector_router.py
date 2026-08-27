from __future__ import annotations

import os
import re
from dataclasses import dataclass
from enum import Enum
from typing import Any, Callable, Protocol


class DataSensitivity(str, Enum):
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"


class VectorBackend(Protocol):
    def search(self, query: str, *, tenant_id: str, limit: int) -> list[dict[str, Any]]: ...


class LazyVectorBackend:
    def __init__(self, factory: Callable[[], VectorBackend]) -> None:
        self.factory = factory
        self._backend: VectorBackend | None = None

    def search(self, query: str, *, tenant_id: str, limit: int) -> list[dict[str, Any]]:
        if self._backend is None:
            self._backend = self.factory()
        return self._backend.search(query, tenant_id=tenant_id, limit=limit)


@dataclass(frozen=True)
class RouteDecision:
    backend: str
    sensitivity: DataSensitivity
    fallback_allowed: bool


class VectorDatabaseRouter:
    """Routes vector reads without permitting cross-tenant or sensitive fallback."""

    def __init__(
        self,
        backends: dict[str, VectorBackend],
        *,
        default_backend: str = "qdrant",
        restricted_backend: str = "pgvector",
    ) -> None:
        self.backends = backends
        self.default_backend = default_backend
        self.restricted_backend = restricted_backend

    @classmethod
    def from_environment(cls) -> "VectorDatabaseRouter":
        default_backend = os.getenv("CLINIGA_VECTOR_DEFAULT_BACKEND", "qdrant").strip()
        restricted_backend = os.getenv("CLINIGA_VECTOR_RESTRICTED_BACKEND", "pgvector").strip()
        return cls(
            {
                "qdrant": LazyVectorBackend(QdrantVectorBackend),
                "pgvector": LazyVectorBackend(PGVectorBackend),
            },
            default_backend=default_backend,
            restricted_backend=restricted_backend,
        )

    def decide(self, sensitivity: DataSensitivity) -> RouteDecision:
        protected = sensitivity in {DataSensitivity.CONFIDENTIAL, DataSensitivity.RESTRICTED}
        return RouteDecision(
            backend=self.restricted_backend if protected else self.default_backend,
            sensitivity=sensitivity,
            fallback_allowed=not protected,
        )

    def search(
        self,
        query: str,
        *,
        tenant_id: str,
        limit: int = 8,
        sensitivity: DataSensitivity = DataSensitivity.INTERNAL,
    ) -> list[dict[str, Any]]:
        if not tenant_id.strip():
            raise PermissionError("tenant_id is required")
        if not 1 <= limit <= 100:
            raise ValueError("limit must be between 1 and 100")
        decision = self.decide(sensitivity)
        backend = self.backends.get(decision.backend)
        if backend is None:
            raise RuntimeError(f"required vector backend {decision.backend!r} is unavailable")
        rows = backend.search(query, tenant_id=tenant_id, limit=limit)
        return [{**row, "vector_backend": decision.backend} for row in rows]


class QdrantVectorBackend:
    def __init__(self, store: Any | None = None) -> None:
        if store is None:
            from ai.rag.qdrant_store import KnowledgeStore

            store = KnowledgeStore()
        self.store = store

    def search(self, query: str, *, tenant_id: str, limit: int) -> list[dict[str, Any]]:
        return self.store.search(query, tenant_id=tenant_id, limit=limit)


class PGVectorBackend:
    """Tenant-filtered pgvector cosine search using a validated table name."""

    def __init__(self, dsn: str | None = None, table: str = "ai_embeddings", embedder: Any | None = None) -> None:
        self.dsn = dsn or os.getenv("CLINIGA_POSTGRES_DSN", "")
        if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", table):
            raise ValueError("invalid pgvector table name")
        self.table = table
        if embedder is None:
            from sentence_transformers import SentenceTransformer

            embedder = SentenceTransformer(
                os.getenv("CLINIGA_EMBED_MODEL", "sentence-transformers/multi-qa-mpnet-base-dot-v1")
            )
        self.embedder = embedder

    def search(self, query: str, *, tenant_id: str, limit: int) -> list[dict[str, Any]]:
        if not self.dsn:
            raise RuntimeError("Postgres DSN is not configured")
        import psycopg
        from pgvector.psycopg import register_vector

        vector = self.embedder.encode(query, normalize_embeddings=True)
        statement = (
            f"SELECT resource_id, content, source, 1 - (embedding <=> %s) AS score "
            f"FROM {self.table} WHERE tenant_id = %s ORDER BY embedding <=> %s LIMIT %s"
        )
        with psycopg.connect(self.dsn) as connection:
            register_vector(connection)
            with connection.cursor() as cursor:
                cursor.execute(statement, (vector, tenant_id, vector, limit))
                rows = cursor.fetchall()
        return [
            {"id": row[0], "text": row[1], "source": row[2], "score": float(row[3]), "tenant_id": tenant_id}
            for row in rows
        ]
