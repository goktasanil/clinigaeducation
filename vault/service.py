from __future__ import annotations

from collections.abc import Callable

from .audit import AppendOnlyAuditLog
from .models import AccessContext, VaultResource
from .policy import authorize


class SecureVaultService:
    """Authorized access facade.

    `read_backend` must be an approved storage adapter (Vault/KMS/S3/etc.).
    The service never discovers credentials or bypasses upstream authorization.
    """

    def __init__(self, read_backend: Callable[[str], bytes], audit_log: AppendOnlyAuditLog | None = None) -> None:
        self.read_backend = read_backend
        self.audit = audit_log or AppendOnlyAuditLog()

    def read(self, ctx: AccessContext, resource: VaultResource) -> bytes:
        try:
            authorize(ctx, resource)
        except PermissionError:
            self.audit.record(
                tenant_id=ctx.tenant_id,
                subject=ctx.subject,
                action="vault.read",
                resource_id=resource.resource_id,
                purpose=ctx.purpose,
                outcome="denied",
            )
            raise

        payload = self.read_backend(resource.resource_id)
        self.audit.record(
            tenant_id=ctx.tenant_id,
            subject=ctx.subject,
            action="vault.read",
            resource_id=resource.resource_id,
            purpose=ctx.purpose,
            outcome="allowed",
        )
        return payload
