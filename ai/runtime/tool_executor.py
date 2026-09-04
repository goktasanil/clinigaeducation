from __future__ import annotations

import inspect
from dataclasses import dataclass
from typing import Any

from ai.security.tool_permissions import ToolPolicy
from ai.skills import registry


@dataclass
class ToolResult:
    status: str
    tool: str
    output: Any = None


class ToolExecutor:
    def __init__(self, policy: ToolPolicy | None = None):
        self.policy = policy or ToolPolicy()

    async def run(self, tool_name: str, arguments: dict[str, Any], approved: bool = False) -> ToolResult:
        decision = self.policy.decision(tool_name)
        if decision == "deny":
            return ToolResult(status="denied", tool=tool_name)
        if decision == "approval_required" and not approved:
            return ToolResult(status="approval_required", tool=tool_name)

        skill = registry.get(tool_name)
        value = skill.handler(**arguments)
        if inspect.isawaitable(value):
            value = await value
        return ToolResult(status="ok", tool=tool_name, output=value)
