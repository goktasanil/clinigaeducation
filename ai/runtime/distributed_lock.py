from __future__ import annotations

import os
import re
import uuid
from contextlib import contextmanager

from redis import Redis

REDIS_URL = os.getenv("CLINIGA_REDIS_URL", "redis://localhost:6379/0")
_LOCK_NAME_RE = re.compile(r"^[A-Za-z0-9_.:-]{1,160}$")
_RELEASE_SCRIPT = """
if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
else
  return 0
end
"""


class DistributedLock:
    def __init__(self, redis_url: str = REDIS_URL) -> None:
        self.redis = Redis.from_url(redis_url, decode_responses=True)

    @staticmethod
    def _key(name: str) -> str:
        if not _LOCK_NAME_RE.fullmatch(name):
            raise ValueError("invalid lock name")
        return f"cliniga:lock:{name}"

    @contextmanager
    def acquire(self, name: str, ttl_seconds: int = 30):
        if not 1 <= int(ttl_seconds) <= 3600:
            raise ValueError("lock TTL must be between 1 and 3600 seconds")
        key = self._key(name)
        token = uuid.uuid4().hex
        acquired = self.redis.set(key, token, nx=True, ex=int(ttl_seconds))
        if not acquired:
            raise RuntimeError("lock_unavailable")
        try:
            yield token
        finally:
            # Compare-and-delete in one Redis operation. A lock that expired and
            # was re-acquired by another worker can never be deleted here.
            self.redis.eval(_RELEASE_SCRIPT, 1, key, token)
