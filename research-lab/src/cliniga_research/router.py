from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path


@dataclass(frozen=True)
class ResearchTool:
    repository: str
    commit: str
    profile: str
    mode: str
    license: str
    purpose: str

    def __post_init__(self) -> None:
        if len(self.commit) != 40 or any(c not in "0123456789abcdef" for c in self.commit):
            raise ValueError(f"invalid commit for {self.repository}")
        if self.mode == "optional_isolated" and self.license in {"missing", "unverified"}:
            raise ValueError(f"runtime profile requires verified license: {self.repository}")


class ToolRouter:
    def __init__(self, tools: tuple[ResearchTool, ...]) -> None:
        self._tools = tools

    @classmethod
    def from_json(cls, path: str | Path) -> "ToolRouter":
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        if data.get("schema_version") != 1:
            raise ValueError("unsupported tool catalogue schema")
        return cls(tuple(ResearchTool(**row) for row in data["tools"]))

    def for_profile(self, profile: str, *, references: bool = False) -> tuple[ResearchTool, ...]:
        modes = {"optional_isolated"}
        if references:
            modes.add("reference_only")
        return tuple(row for row in self._tools if row.profile == profile and row.mode in modes)

    def all(self) -> tuple[ResearchTool, ...]:
        return self._tools

