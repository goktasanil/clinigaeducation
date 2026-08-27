from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Any

try:
    from langfuse import Langfuse
except Exception:  # optional runtime dependency
    Langfuse = None  # type: ignore


class Tracer:
    def __init__(self) -> None:
        self.enabled = bool(os.getenv("LANGFUSE_PUBLIC_KEY") and os.getenv("LANGFUSE_SECRET_KEY"))
        self.client = Langfuse() if self.enabled and Langfuse is not None else None

    @contextmanager
    def span(self, name: str, *, metadata: dict[str, Any] | None = None):
        if not self.client:
            yield None
            return
        trace = self.client.trace(name=name, metadata=metadata or {})
        try:
            yield trace
        finally:
            try:
                self.client.flush()
            except Exception:
                pass


tracer = Tracer()
