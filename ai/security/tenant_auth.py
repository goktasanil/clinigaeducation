from __future__ import annotations

import hmac
import json
import os
from dataclasses import dataclass

VALID_ROLES = {"viewer", "editor", "admin"}


@dataclass(frozen=True)
class TenantContext:
    tenant_id: str
    subject: str = "api-key"
    role: str = "admin"


def _load_raw_config() -> str:
    raw = os.getenv("CLINIGA_TENANT_KEYS_JSON", "").strip()
    if raw:
        return raw
    secret_id = os.getenv("CLINIGA_TENANT_KEYS_SECRET_ID", "").strip()
    if not secret_id:
        return "{}"
    import boto3
    client = boto3.client("secretsmanager", region_name=os.getenv("CLINIGA_SECRETS_REGION") or None)
    response = client.get_secret_value(SecretId=secret_id)
    value = response.get("SecretString")
    if not value:
        raise RuntimeError("Tenant key secret must contain SecretString JSON")
    return value


def _keys() -> dict[str, dict[str, str]]:
    try:
        data = json.loads(_load_raw_config())
    except json.JSONDecodeError as exc:
        raise RuntimeError("Tenant credential configuration must be valid JSON") from exc
    if not isinstance(data, dict):
        raise RuntimeError("Tenant credential configuration must be a JSON object")
    normalized: dict[str, dict[str, str]] = {}
    for tenant_id, value in data.items():
        tenant = str(tenant_id)
        if isinstance(value, str):
            normalized[tenant] = {"api_key": value, "role": "admin", "subject": "api-key"}
            continue
        if not isinstance(value, dict):
            raise RuntimeError(f"Tenant credential entry for {tenant} must be a string or object")
        api_key = str(value.get("api_key") or value.get("key") or "")
        role = str(value.get("role") or "viewer")
        subject = str(value.get("subject") or "api-key")
        if not api_key:
            raise RuntimeError(f"Tenant credential entry for {tenant} is missing api_key")
        if role not in VALID_ROLES:
            raise RuntimeError(f"Invalid role for tenant {tenant}: {role}")
        normalized[tenant] = {"api_key": api_key, "role": role, "subject": subject}
    return normalized


def authenticate(tenant_id: str, api_key: str) -> TenantContext:
    keys = _keys()
    if not keys:
        if os.getenv("CLINIGA_ALLOW_INSECURE_DEV_AUTH", "false").lower() == "true":
            role = os.getenv("CLINIGA_DEV_ROLE", "admin")
            if role not in VALID_ROLES:
                raise RuntimeError("CLINIGA_DEV_ROLE must be viewer, editor, or admin")
            return TenantContext(tenant_id=tenant_id, subject="insecure-dev", role=role)
        raise PermissionError("Tenant authentication is not configured")
    expected = keys.get(tenant_id)
    if not expected or not hmac.compare_digest(expected["api_key"], api_key):
        raise PermissionError("Invalid tenant credentials")
    return TenantContext(tenant_id=tenant_id, subject=expected["subject"], role=expected["role"])
