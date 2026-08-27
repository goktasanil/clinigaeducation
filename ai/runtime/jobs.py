from __future__ import annotations

import tempfile
from pathlib import Path

from ai.ingestion.pipeline import ingest_paths
from ai.runtime.postgres_state import audit, update_job
from ai.storage.object_store import ObjectStore


def process_ingest_object_job(job_id: str, tenant_id: str, actor: str, object_key: str) -> dict:
    update_job(job_id, tenant_id, status="running")
    try:
        filename = Path(object_key).name or "document.bin"
        with tempfile.TemporaryDirectory(prefix="cliniga-ingest-") as temp_dir:
            destination = str(Path(temp_dir) / filename)
            ObjectStore().download(tenant_id, object_key, destination)
            chunks = ingest_paths([destination], tenant_id=tenant_id)
        result = {"object_key": object_key, "chunks_ingested": chunks}
        update_job(job_id, tenant_id, status="succeeded", result=result)
        audit(tenant_id, actor, "ingest.async.succeeded", object_key, {"job_id": job_id, "chunks_ingested": chunks})
        return result
    except Exception as exc:
        message = f"{type(exc).__name__}: {exc}"[:2000]
        update_job(job_id, tenant_id, status="failed", error=message)
        audit(tenant_id, actor, "ingest.async.failed", object_key, {"job_id": job_id, "error": message})
        raise
