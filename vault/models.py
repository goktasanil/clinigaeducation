from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Sensitivity(str, Enum):
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"


@dataclass(frozen=True)
class AccessContext:
    tenant_id: str
    subject: str
    role: str
    purpose: str
    approved: bool = False
    break_glass: bool = False


@dataclass(frozen=True)
class VaultResource:
    resource_id: str
    tenant_id: str
    sensitivity: Sensitivity
    owner: str
