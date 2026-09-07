from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import Awaitable, Callable, TypeVar

T = TypeVar('T')


@dataclass
class CircuitBreaker:
    failure_threshold: int = 5
    recovery_seconds: int = 30
    failures: int = 0
    opened_at: float | None = None

    def _is_open(self) -> bool:
        if self.opened_at is None:
            return False
        if time.time() - self.opened_at >= self.recovery_seconds:
            self.failures = 0
            self.opened_at = None
            return False
        return True

    async def call(self, fn: Callable[[], Awaitable[T]]) -> T:
        if self._is_open():
            raise RuntimeError('circuit_open')
        try:
            result = await fn()
            self.failures = 0
            return result
        except Exception:
            self.failures += 1
            if self.failures >= self.failure_threshold:
                self.opened_at = time.time()
            raise


async def retry_async(fn: Callable[[], Awaitable[T]], attempts: int = 3, base_delay: float = 0.25) -> T:
    last_exc: Exception | None = None
    for attempt in range(attempts):
        try:
            return await fn()
        except Exception as exc:
            last_exc = exc
            if attempt + 1 == attempts:
                break
            await asyncio.sleep(base_delay * (2 ** attempt))
    assert last_exc is not None
    raise last_exc
