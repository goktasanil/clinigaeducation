from __future__ import annotations

from mem0 import Memory

from .registry import Skill, registry

_memory = Memory()


def remember(user_id: str, text: str):
    return _memory.add(text, user_id=user_id)


def recall(user_id: str, query: str, limit: int = 5):
    return _memory.search(query, user_id=user_id, limit=limit)


registry.register(Skill(
    name="memory.remember",
    description="Store durable user or project memory.",
    handler=remember,
))
registry.register(Skill(
    name="memory.recall",
    description="Retrieve relevant durable memory for a query.",
    handler=recall,
))
