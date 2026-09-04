from __future__ import annotations

import os
from rq import Queue
from redis import Redis

REDIS_URL = os.getenv("CLINIGA_REDIS_URL", "redis://localhost:6379/0")

redis_conn = Redis.from_url(REDIS_URL)
queue = Queue("cliniga-ai", connection=redis_conn, default_timeout=1800)


def enqueue(func, *args, **kwargs):
    return queue.enqueue(func, *args, **kwargs)
