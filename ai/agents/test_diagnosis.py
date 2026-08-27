from __future__ import annotations

from dataclasses import dataclass
import re


@dataclass(frozen=True)
class FailureDiagnosis:
    category: str
    evidence: str
    next_action: str


class TestFailureDiagnoser:
    PATTERNS = [
        (re.compile(r"ModuleNotFoundError|ImportError", re.I), "import", "inspect import path/package layout"),
        (re.compile(r"AssertionError", re.I), "assertion", "compare expected vs actual and inspect nearest changed code"),
        (re.compile(r"Timeout|timed out", re.I), "timeout", "check blocking I/O, retries, and external dependencies"),
        (re.compile(r"PermissionError|403|forbidden", re.I), "permission", "verify policy and required authorization; do not bypass controls"),
        (re.compile(r"connection refused|ECONNREFUSED", re.I), "dependency", "verify service health and dependency configuration"),
    ]

    def diagnose(self, log: str) -> FailureDiagnosis:
        for pattern, category, action in self.PATTERNS:
            match = pattern.search(log)
            if match:
                start = max(0, match.start() - 160)
                end = min(len(log), match.end() + 320)
                return FailureDiagnosis(category, log[start:end].strip(), action)
        tail = log[-800:].strip()
        return FailureDiagnosis("unknown", tail, "inspect the smallest reproducible failing step before editing")
