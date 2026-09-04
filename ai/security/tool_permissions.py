from dataclasses import dataclass, field


@dataclass
class ToolPolicy:
    allowed: set[str] = field(default_factory=lambda: {
        "rag.search",
        "memory.search",
        "browser.read",
        "mcp.list_tools",
        "engineering.localize_issue",
        "clinical.review_professional_answer",
        "security.scan_local",
        "security.generate_sbom",
        "security.scan_vulnerabilities",
        "security.artifact_triage",
        "security.validate_sigma",
        "security.extract_iocs",
    })
    approval_required: set[str] = field(default_factory=lambda: {
        "browser.write",
        "workflow.write",
        "provider.external_action",
        "github.write",
        "email.send",
        "calendar.write",
    })
    denied: set[str] = field(default_factory=lambda: {
        "shell.unrestricted",
        "secrets.read",
        "credential.export",
        "credential.dump",
        "payload.generate",
        "reverse_shell.open",
        "persistence.install",
        "privilege_escalation",
        "exploit.execute",
        "exploit.external_target",
    })

    def decision(self, tool_name: str) -> str:
        if tool_name in self.denied:
            return "deny"
        if tool_name in self.approval_required:
            return "approval_required"
        if tool_name in self.allowed:
            return "allow"
        return "deny"
