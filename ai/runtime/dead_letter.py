from __future__ import annotations

import json
import os
from redis import Redis

REDIS_URL = os.getenv('CLINIGA_REDIS_URL', 'redis://localhost:6379/0')
DLQ_KEY = os.getenv('CLINIGA_DLQ_KEY', 'cliniga:dlq')


class DeadLetterQueue:
    def __init__(self, redis_url: str = REDIS_URL) -> None:
        self.redis = Redis.from_url(redis_url, decode_responses=True)

    def push(self, job_id: str, tenant_id: str, error: str, payload: dict) -> None:
        item = {
            'job_id': job_id,
            'tenant_id': tenant_id,
            'error': error,
            'payload': payload,
        }
        self.redis.rpush(DLQ_KEY, json.dumps(item, ensure_ascii=False))

    def pop(self) -> dict | None:
        raw = self.redis.lpop(DLQ_KEY)
        return json.loads(raw) if raw else None

    def size(self) -> int:
        return int(self.redis.llen(DLQ_KEY))
