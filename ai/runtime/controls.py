from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass
from threading import Lock
import time


@dataclass
class CacheEntry:
    value: object
    expires_at: float


class TTLCache:
    def __init__(self, ttl_seconds: int = 120, max_items: int = 1024):
        self.ttl_seconds = ttl_seconds
        self.max_items = max_items
        self._data: dict[str, CacheEntry] = {}
        self._lock = Lock()

    def get(self, key: str):
        now = time.time()
        with self._lock:
            entry = self._data.get(key)
            if not entry or entry.expires_at <= now:
                self._data.pop(key, None)
                return None
            return entry.value

    def set(self, key: str, value: object):
        with self._lock:
            if len(self._data) >= self.max_items:
                oldest = min(self._data, key=lambda k: self._data[k].expires_at)
                self._data.pop(oldest, None)
            self._data[key] = CacheEntry(value, time.time() + self.ttl_seconds)


class SlidingWindowRateLimiter:
    def __init__(self, limit: int = 60, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, key: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds
        with self._lock:
            q = self._events[key]
            while q and q[0] < cutoff:
                q.popleft()
            if len(q) >= self.limit:
                return False
            q.append(now)
            return True


class Metrics:
    def __init__(self):
        self._counters = defaultdict(int)
        self._lock = Lock()

    def inc(self, name: str, amount: int = 1):
        with self._lock:
            self._counters[name] += amount

    def snapshot(self) -> dict[str, int]:
        with self._lock:
            return dict(self._counters)


cache = TTLCache()
rate_limiter = SlidingWindowRateLimiter()
metrics = Metrics()
