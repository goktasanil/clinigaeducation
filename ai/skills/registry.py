from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Any


@dataclass
class Skill:
    name: str
    description: str
    handler: Callable[..., Any]


class SkillRegistry:
    def __init__(self) -> None:
        self._skills: dict[str, Skill] = {}

    def register(self, skill: Skill) -> None:
        self._skills[skill.name] = skill

    def get(self, name: str) -> Skill:
        return self._skills[name]

    def list(self) -> list[dict[str, str]]:
        return [
            {"name": skill.name, "description": skill.description}
            for skill in self._skills.values()
        ]


registry = SkillRegistry()
