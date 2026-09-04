import os

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, FieldCondition, Filter, MatchValue, PointStruct, VectorParams
from sentence_transformers import SentenceTransformer

COLLECTION = os.getenv("CLINIGA_QDRANT_COLLECTION", "cliniga_knowledge")
QDRANT_URL = os.getenv("CLINIGA_QDRANT_URL", "http://localhost:6333")
EMBED_MODEL = os.getenv("CLINIGA_EMBED_MODEL", "sentence-transformers/multi-qa-mpnet-base-dot-v1")


class KnowledgeStore:
    def __init__(self):
        self.embedder = SentenceTransformer(EMBED_MODEL)
        self.client = QdrantClient(url=QDRANT_URL)
        dim = self.embedder.get_sentence_embedding_dimension()
        existing = {c.name for c in self.client.get_collections().collections}
        if COLLECTION not in existing:
            self.client.create_collection(
                collection_name=COLLECTION,
                vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
            )

    def add(self, docs):
        docs = list(docs)
        if not docs:
            return
        for doc in docs:
            metadata = doc.get("metadata") or {}
            tenant_id = str(metadata.get("tenant_id") or "").strip()
            if not tenant_id:
                raise ValueError("RAG writes require tenant_id metadata")
            source = str(doc.get("source") or "").strip()
            if not source or source.lower() == "unknown":
                raise ValueError("RAG writes require a concrete source for citation grounding")
            if not str(doc.get("text") or "").strip():
                raise ValueError("RAG writes require non-empty text")

        texts = [doc["text"] for doc in docs]
        vectors = self.embedder.encode(texts, normalize_embeddings=True).tolist()
        points = []
        for i, (doc, vector) in enumerate(zip(docs, vectors)):
            metadata = doc.get("metadata") or {}
            payload = {
                "text": doc["text"],
                "source": doc["source"],
                **metadata,
            }
            points.append(PointStruct(id=doc.get("id", i), vector=vector, payload=payload))
        self.client.upsert(collection_name=COLLECTION, points=points)

    def search(self, query, limit=6, tenant_id: str | None = None):
        tenant = str(tenant_id or "").strip()
        if not tenant:
            raise ValueError("tenant_id is required for RAG search")
        vector = self.embedder.encode(query, normalize_embeddings=True).tolist()
        query_filter = Filter(
            must=[FieldCondition(key="tenant_id", match=MatchValue(value=tenant))]
        )
        hits = self.client.search(
            collection_name=COLLECTION,
            query_vector=vector,
            query_filter=query_filter,
            limit=max(1, min(int(limit), 50)),
        )
        return [
            {
                "score": hit.score,
                "text": hit.payload.get("text", ""),
                "source": hit.payload.get("source", ""),
                "tenant_id": hit.payload.get("tenant_id"),
            }
            for hit in hits
            if hit.payload.get("tenant_id") == tenant
        ]
