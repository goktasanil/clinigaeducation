from __future__ import annotations

from .models import AccessContext, Sensitivity, VaultResource


ROLE_PERMISSIONS = {
    "viewer": {"read_internal"},
    "analyst": {"read_internal", "read_confidential"},
    "admin": {"read_internal", "read_confidential", "read_restricted", "approve_access"},
}


def authorize(ctx: AccessContext, resource: VaultResource) -> None:
    if ctx.tenant_id != resource.tenant_id:
        raise PermissionError("cross-tenant access denied")
    if not ctx.purpose.strip():
        raise PermissionError("access purpose required")

    perms = ROLE_PERMISSIONS.get(ctx.role, set())
    required = {
        Sensitivity.INTERNAL: "read_internal",
        Sensitivity.CONFIDENTIAL: "read_confidential",
        Sensitivity.RESTRICTED: "read_restricted",
    }[resource.sensitivity]

    if required not in perms:
        raise PermissionError("insufficient role permission")

    if resource.sensitivity is Sensitivity.RESTRICTED and not (ctx.approved or ctx.break_glass):
        raise PermissionError("restricted access requires approval")

    if ctx.break_glass and ctx.role != "admin":
        raise PermissionError("break-glass access is admin-only")
