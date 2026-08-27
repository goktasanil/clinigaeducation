# Secure Intelligence Vault

A security-first subsystem for storing and accessing **authorized sensitive information only**.

## Security principles
- deny-by-default access
- tenant isolation
- least privilege RBAC/ABAC
- immutable audit trail
- explicit approval for sensitive reads
- break-glass access is time-limited and audited
- encrypted-at-rest and encrypted-in-transit storage
- no plaintext secrets in Git
- no credential harvesting or access-control bypass

## Components
- `vault/policy.py` — RBAC/ABAC and approval rules
- `vault/service.py` — authorized secret/document access facade
- `vault/audit.py` — append-only audit events
- `vault/models.py` — typed request/context models
- `.github/workflows/vault-security.yml` — static security checks

This module is intentionally isolated from the main application runtime until explicitly integrated.
