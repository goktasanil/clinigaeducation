from __future__ import annotations

import hashlib
from dataclasses import dataclass
from difflib import unified_diff
from pathlib import PurePosixPath


def validate_repo_path(path: str) -> str:
    value = str(path or "").replace("\\", "/").strip()
    candidate = PurePosixPath(value)
    if not value or candidate.is_absolute():
        raise ValueError("patch path must be a non-empty repository-relative path")
    if any(part in {"", ".", ".."} for part in candidate.parts):
        raise ValueError("patch path may not contain traversal or ambiguous segments")
    normalized = candidate.as_posix()
    if normalized.startswith(".git/") or normalized == ".git":
        raise PermissionError("patch editor may not modify Git metadata")
    return normalized


def content_sha256(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


@dataclass(frozen=True)
class PatchPlan:
    path: str
    before: str
    after: str
    base_sha256: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "path", validate_repo_path(self.path))
        expected = self.base_sha256 or content_sha256(self.before)
        if expected != content_sha256(self.before):
            raise ValueError("base_sha256 does not match patch before-content")
        object.__setattr__(self, "base_sha256", expected)

    def verify_current(self, current_content: str) -> None:
        if content_sha256(current_content) != self.base_sha256:
            raise RuntimeError(f"stale patch rejected for {self.path}")

    def apply_to(self, current_content: str) -> str:
        self.verify_current(current_content)
        return self.after

    def diff(self) -> str:
        return "".join(
            unified_diff(
                self.before.splitlines(keepends=True),
                self.after.splitlines(keepends=True),
                fromfile=f"a/{self.path}",
                tofile=f"b/{self.path}",
            )
        )


class PatchEditor:
    """Prefer minimal, reviewable changes with path and stale-base validation."""

    @staticmethod
    def replace_once(path: str, content: str, old: str, new: str) -> PatchPlan:
        safe_path = validate_repo_path(path)
        if not old:
            raise ValueError("replacement source may not be empty")
        count = content.count(old)
        if count != 1:
            raise ValueError(f"Expected exactly one match in {safe_path}; found {count}")
        return PatchPlan(
            path=safe_path,
            before=content,
            after=content.replace(old, new, 1),
            base_sha256=content_sha256(content),
        )
