from __future__ import annotations

import hmac
import json
import os
from dataclasses import dataclass


@dataclass(frozen=True)
class TenantContext:
    tenant_id: str


def _keys() -> dict[str, str]:
    raw = os.getenv('CLINIGA_TENANT_KEYS_JSON', '{}')
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError('CLINIGA_TENANT_KEYS_JSON must be valid JSON') from exc
    return {str(k): str(v) for k, v in data.items()}


def authenticate(tenant_id: str, api_key: str) -> TenantContext:
    keys = _keys()
    if not keys:
        if os.getenv('CLINIGA_ALLOW_INSECURE_DEV_AUTH', 'false').lower() == 'true':
            return TenantContext(tenant_id=tenant_id)
        raise PermissionError('Tenant authentication is not configured')
    expected = keys.get(tenant_id)
    if not expected or not hmac.compare_digest(expected, api_key):
        raise PermissionError('Invalid tenant credentials')
    return TenantContext(tenant_id=tenant_id)
