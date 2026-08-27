from __future__ import annotations

import os
from pathlib import Path

import boto3

ENDPOINT = os.getenv("CLINIGA_S3_ENDPOINT", "http://localhost:9000")
BUCKET = os.getenv("CLINIGA_S3_BUCKET", "cliniga-ai")
ACCESS_KEY = os.getenv("CLINIGA_S3_ACCESS_KEY", "minioadmin")
SECRET_KEY = os.getenv("CLINIGA_S3_SECRET_KEY", "minioadmin")
REGION = os.getenv("CLINIGA_S3_REGION", "us-east-1")


class ObjectStore:
    def __init__(self) -> None:
        self.client = boto3.client(
            "s3",
            endpoint_url=ENDPOINT,
            aws_access_key_id=ACCESS_KEY,
            aws_secret_access_key=SECRET_KEY,
            region_name=REGION,
        )
        try:
            self.client.head_bucket(Bucket=BUCKET)
        except Exception:
            self.client.create_bucket(Bucket=BUCKET)

    def upload(self, tenant_id: str, path: str) -> str:
        p = Path(path)
        key = f"{tenant_id}/{p.name}"
        self.client.upload_file(str(p), BUCKET, key)
        return key

    def download(self, tenant_id: str, key: str, destination: str) -> str:
        if not key.startswith(f"{tenant_id}/"):
            raise PermissionError("cross-tenant object access denied")
        self.client.download_file(BUCKET, key, destination)
        return destination
