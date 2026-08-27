from __future__ import annotations

from dataclasses import dataclass
from difflib import unified_diff


@dataclass(frozen=True)
class PatchPlan:
    path: str
    before: str
    after: str

    def diff(self) -> str:
        return "".join(unified_diff(
            self.before.splitlines(keepends=True),
            self.after.splitlines(keepends=True),
            fromfile=f"a/{self.path}",
            tofile=f"b/{self.path}",
        ))


class PatchEditor:
    """Prefer minimal, reviewable changes instead of whole-file rewrites."""

    @staticmethod
    def replace_once(path: str, content: str, old: str, new: str) -> PatchPlan:
        count = content.count(old)
        if count != 1:
            raise ValueError(f"Expected exactly one match in {path}; found {count}")
        return PatchPlan(path=path, before=content, after=content.replace(old, new, 1))
