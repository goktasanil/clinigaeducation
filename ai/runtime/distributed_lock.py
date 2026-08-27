from __future__ import annotations

import os
import uuid
from contextlib import contextmanager

from redis import Redis

REDIS_URL = os.getenv('CLINIGA_REDIS_URL', 'redis://localhost:6379/0')


class DistributedLock:
    def __init__(self, redis_url: str = REDIS_URL) -> None:
        self.redis = Redis.from_url(redis_url, decode_responses=True)

    @contextmanager
    def acquire(self, name: str, ttl_seconds: int = 30):
        key = f'cliniga:lock:{name}'
        token = str(uuid.uuid4())
        acquired = self.redis.set(key, token, nx=True, ex=ttl_seconds)
        if not acquired:
            raise RuntimeError('lock_unavailable')
        try:
            yield token
        finally:
            current = self.redis.get(key)
            if current == token:
                self.redis.delete(key)
