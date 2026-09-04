from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class ContextItem:
    key: str
    text: str
    priority: int = 0
    group: str = "general"


class HierarchicalContextManager:
    """Build bounded context from summaries first, details second.

    This is intentionally model-agnostic and keeps the full source corpus outside
    the prompt while selecting the most relevant/high-priority items.
    """

    def __init__(self, max_chars: int = 120_000) -> None:
        self.max_chars = max_chars

    def build(self, summaries: Iterable[ContextItem], details: Iterable[ContextItem]) -> str:
        ordered = sorted(list(summaries), key=lambda x: x.priority, reverse=True)
        ordered += sorted(list(details), key=lambda x: x.priority, reverse=True)

        out: list[str] = []
        used = 0
        for item in ordered:
            block = f"[{item.group}:{item.key}]\n{item.text.strip()}\n"
            if used + len(block) > self.max_chars:
                continue
            out.append(block)
            used += len(block)
        return "\n".join(out)
