from __future__ import annotations

import re

from mem0 import Memory

from .registry import Skill, registry

_memory = Memory()
_USER_KEY_RE = re.compile(r"^[A-Za-z0-9_.:@-]{1,420}$")


def _user_key(user_id: str) -> str:
    value = str(user_id or "").strip()
    if not _USER_KEY_RE.fullmatch(value):
        raise ValueError("memory user_id is invalid")
    # Runtime callers use <tenant>:<user>. Requiring a namespace prevents a
    # generic unscoped memory bucket from being used accidentally.
    if ":" not in value:
        raise ValueError("memory user_id must be tenant/user namespaced")
    return value


def remember(user_id: str, text: str):
    user_key = _user_key(user_id)
    value = str(text or "").strip()
    if not value or len(value) > 20_000:
        raise ValueError("memory text must be between 1 and 20000 characters")
    return _memory.add(value, user_id=user_key)


def recall(user_id: str, query: str, limit: int = 5):
    user_key = _user_key(user_id)
    value = str(query or "").strip()
    if not value or len(value) > 5000:
        raise ValueError("memory query must be between 1 and 5000 characters")
    bounded_limit = max(1, min(int(limit), 20))
    return _memory.search(value, user_id=user_key, limit=bounded_limit)


registry.register(
    Skill(
        name="memory.remember",
        description="Store memory in the configured tenant/user-scoped memory backend.",
        handler=remember,
    )
)
registry.register(
    Skill(
        name="memory.recall",
        description="Retrieve relevant tenant/user-scoped memory from the configured backend.",
        handler=recall,
    )
)
