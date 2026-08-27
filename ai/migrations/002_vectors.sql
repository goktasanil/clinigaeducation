CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS ai_embeddings (
    tenant_id TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding vector(768) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (tenant_id, resource_id)
);

CREATE INDEX IF NOT EXISTS ai_embeddings_tenant_idx
    ON ai_embeddings (tenant_id);

CREATE INDEX IF NOT EXISTS ai_embeddings_hnsw_idx
    ON ai_embeddings USING hnsw (embedding vector_cosine_ops);

