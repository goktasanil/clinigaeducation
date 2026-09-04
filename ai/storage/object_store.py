from __future__ import annotations

import os
import uuid
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

ENDPOINT = os.getenv("CLINIGA_S3_ENDPOINT", "http://localhost:9000")
BUCKET = os.getenv("CLINIGA_S3_BUCKET", "cliniga-ai")
ACCESS_KEY = os.getenv("CLINIGA_S3_ACCESS_KEY", "minioadmin")
SECRET_KEY = os.getenv("CLINIGA_S3_SECRET_KEY", "minioadmin")
REGION = os.getenv("CLINIGA_S3_REGION", "us-east-1")
SSE = os.getenv("CLINIGA_S3_SSE", "").strip()


class ObjectStore:
    def __init__(self) -> None:
        self.client = boto3.client("s3", endpoint_url=ENDPOINT or None, aws_access_key_id=ACCESS_KEY or None, aws_secret_access_key=SECRET_KEY or None, region_name=REGION)
        self._ensure_bucket()

    def _ensure_bucket(self) -> None:
        try:
            self.client.head_bucket(Bucket=BUCKET)
            return
        except ClientError as exc:
            code = str(exc.response.get("Error", {}).get("Code", ""))
            if code not in {"404", "NoSuchBucket", "NotFound"}:
                raise
        self.client.create_bucket(Bucket=BUCKET)

    def _extra(self) -> dict:
        return {"ServerSideEncryption": SSE} if SSE else {}

    def _tenant_key(self, tenant_id: str, filename: str) -> str:
        safe_name = Path(filename).name or "document.bin"
        return f"{tenant_id}/{uuid.uuid4().hex}/{safe_name}"

    def upload_bytes(self, tenant_id: str, filename: str, content: bytes, content_type: str | None = None) -> str:
        key = self._tenant_key(tenant_id, filename)
        params = {"Bucket": BUCKET, "Key": key, "Body": content, **self._extra()}
        if content_type:
            params["ContentType"] = content_type
        self.client.put_object(**params)
        return key

    def download(self, tenant_id: str, key: str, destination: str) -> str:
        if not key.startswith(f"{tenant_id}/"):
            raise PermissionError("cross-tenant object access denied")
        self.client.download_file(BUCKET, key, destination)
        return destination
