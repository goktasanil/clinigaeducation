from __future__ import annotations

import json
import os
from dataclasses import dataclass

import redis

REDIS_URL = os.getenv("CLINIGA_REDIS_URL", "redis://localhost:6379/0")


@dataclass
class RedisCache:
    prefix: str = "cliniga:cache"

    def __post_init__(self) -> None:
        self.client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

    def _key(self, tenant_id: str, key: str) -> str:
        return f"{self.prefix}:{tenant_id}:{key}"

    def get(self, tenant_id: str, key: str):
        raw = self.client.get(self._key(tenant_id, key))
        return None if raw is None else json.loads(raw)

    def set(self, tenant_id: str, key: str, value, ttl_seconds: int = 300) -> None:
        self.client.setex(self._key(tenant_id, key), ttl_seconds, json.dumps(value))


class RedisRateLimiter:
    def __init__(self, limit: int = 120, window_seconds: int = 60) -> None:
        self.client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        self.limit = limit
        self.window_seconds = window_seconds

    def allow(self, tenant_id: str, bucket: str = "api") -> bool:
        key = f"cliniga:ratelimit:{tenant_id}:{bucket}"
        pipe = self.client.pipeline()
        pipe.incr(key)
        pipe.ttl(key)
        count, ttl = pipe.execute()
        if ttl < 0:
            self.client.expire(key, self.window_seconds)
        return int(count) <= self.limit
