import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams, Filter, FieldCondition, MatchValue
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
        texts = [doc["text"] for doc in docs]
        vectors = self.embedder.encode(texts, normalize_embeddings=True).tolist()
        points = []
        for i, (doc, vector) in enumerate(zip(docs, vectors)):
            payload = {"text": doc["text"], "source": doc.get("source", "unknown"), **doc.get("metadata", {})}
            points.append(PointStruct(id=doc.get("id", i), vector=vector, payload=payload))
        self.client.upsert(collection_name=COLLECTION, points=points)

    def search(self, query, limit=6, tenant_id: str | None = None):
        vector = self.embedder.encode(query, normalize_embeddings=True).tolist()
        query_filter = None
        if tenant_id:
            query_filter = Filter(must=[FieldCondition(key="tenant_id", match=MatchValue(value=tenant_id))])
        hits = self.client.search(
            collection_name=COLLECTION,
            query_vector=vector,
            query_filter=query_filter,
            limit=limit,
        )
        return [
            {
                "score": hit.score,
                "text": hit.payload.get("text", ""),
                "source": hit.payload.get("source", "unknown"),
                "tenant_id": hit.payload.get("tenant_id"),
            }
            for hit in hits
        ]
