from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from threading import Lock


@dataclass(frozen=True)
class AuditEvent:
    timestamp: str
    tenant_id: str
    subject: str
    action: str
    resource_id: str
    purpose: str
    outcome: str


class AppendOnlyAuditLog:
    def __init__(self, path: str = "vault/audit.log") -> None:
        self.path = Path(path)
        self._lock = Lock()

    def record(self, *, tenant_id: str, subject: str, action: str, resource_id: str, purpose: str, outcome: str) -> None:
        event = AuditEvent(
            timestamp=datetime.now(timezone.utc).isoformat(),
            tenant_id=tenant_id,
            subject=subject,
            action=action,
            resource_id=resource_id,
            purpose=purpose,
            outcome=outcome,
        )
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self._lock, self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(asdict(event), ensure_ascii=False) + "\n")
