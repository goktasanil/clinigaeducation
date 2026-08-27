from __future__ import annotations

import hashlib
import os
import re
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Any, Iterator
from urllib.parse import urlparse

_SAFE_VALUE = re.compile(r"[^A-Za-z0-9_.:@/-]")


def _safe(value: str, limit: int = 200) -> str:
    return _SAFE_VALUE.sub("_", value)[:limit]


def tenant_hash(tenant_id: str) -> str:
    return hashlib.sha256(tenant_id.encode("utf-8")).hexdigest()[:16]


@dataclass(frozen=True)
class HeliconeConfig:
    proxy_url: str = ""
    api_key: str = ""

    @classmethod
    def from_env(cls) -> "HeliconeConfig":
        return cls(
            proxy_url=os.getenv("CLINIGA_HELICONE_PROXY_URL", "").strip().rstrip("/"),
            api_key=os.getenv("HELICONE_API_KEY", "").strip(),
        )

    @property
    def enabled(self) -> bool:
        return bool(self.proxy_url and self.api_key)

    def validate(self) -> None:
        if not self.enabled:
            return
        parsed = urlparse(self.proxy_url)
        allow_insecure = os.getenv("CLINIGA_ALLOW_INSECURE_TELEMETRY", "false").lower() == "true"
        if parsed.scheme not in ({"http", "https"} if allow_insecure else {"https"}) or not parsed.netloc:
            raise ValueError("Helicone proxy must be an explicit HTTPS URL")

    def headers(
        self,
        *,
        user_id: str | None = None,
        session_id: str | None = None,
        properties: dict[str, str] | None = None,
    ) -> dict[str, str]:
        if not self.enabled:
            return {}
        self.validate()
        headers = {"Helicone-Auth": f"Bearer {self.api_key}"}
        if user_id:
            headers["Helicone-User-Id"] = _safe(user_id)
        if session_id:
            headers["Helicone-Session-Id"] = _safe(session_id)
        for key, value in (properties or {}).items():
            headers[f"Helicone-Property-{_safe(key, 80)}"] = _safe(value)
        return headers


@contextmanager
def model_span(
    operation: str,
    *,
    model: str,
    tenant_id: str | None = None,
    attributes: dict[str, Any] | None = None,
) -> Iterator[Any]:
    """Create a content-free OpenTelemetry span when the SDK is available."""
    try:
        from opentelemetry import trace
    except ImportError:
        yield None
        return

    tracer = trace.get_tracer("cliniga.ai.model")
    with tracer.start_as_current_span(f"model.{_safe(operation, 80)}") as span:
        span.set_attribute("gen_ai.operation.name", _safe(operation, 80))
        span.set_attribute("gen_ai.request.model", _safe(model))
        if tenant_id:
            span.set_attribute("cliniga.tenant.hash", tenant_hash(tenant_id))
        for key, value in (attributes or {}).items():
            if key.lower() in {"prompt", "messages", "response", "content", "api_key", "token"}:
                continue
            if isinstance(value, (str, int, float, bool)):
                span.set_attribute(f"cliniga.{_safe(key, 80)}", _safe(value) if isinstance(value, str) else value)
        yield span

