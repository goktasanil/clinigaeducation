from __future__ import annotations

from dataclasses import dataclass

ROLE_PERMISSIONS = {
    "viewer": {"agent.read", "retrieve.read", "metrics.read"},
    "editor": {"agent.read", "retrieve.read", "ingest.write", "metrics.read"},
    "admin": {"agent.read", "retrieve.read", "ingest.write", "metrics.read", "audit.read", "tenant.manage"},
}


@dataclass(frozen=True)
class Principal:
    tenant_id: str
    subject: str
    role: str

    def can(self, permission: str) -> bool:
        return permission in ROLE_PERMISSIONS.get(self.role, set())


def require(principal: Principal, permission: str) -> None:
    if not principal.can(permission):
        raise PermissionError(f"permission denied: {permission}")
