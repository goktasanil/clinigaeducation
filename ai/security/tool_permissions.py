from dataclasses import dataclass, field


@dataclass
class ToolPolicy:
    allowed: set[str] = field(default_factory=lambda: {"rag.search", "memory.search", "browser.read", "mcp.list_tools"})
    approval_required: set[str] = field(default_factory=lambda: {"browser.write", "github.write", "email.send", "calendar.write"})
    denied: set[str] = field(default_factory=lambda: {"shell.unrestricted", "secrets.read", "credential.export"})

    def decision(self, tool_name: str) -> str:
        if tool_name in self.denied:
            return "deny"
        if tool_name in self.approval_required:
            return "approval_required"
        if tool_name in self.allowed:
            return "allow"
        return "deny"
