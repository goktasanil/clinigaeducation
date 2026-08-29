from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass


@dataclass(frozen=True)
class FailureDiagnosis:
    category: str
    evidence: str
    next_action: str
    fingerprint: str = ""


class TestFailureDiagnoser:
    PATTERNS = [
        (re.compile(r"ModuleNotFoundError|ImportError", re.I), "import", "inspect import path/package layout"),
        (re.compile(r"AssertionError", re.I), "assertion", "compare expected vs actual and inspect nearest changed code"),
        (re.compile(r"Timeout|timed out", re.I), "timeout", "check blocking I/O, retries, and external dependencies"),
        (re.compile(r"PermissionError|403|forbidden", re.I), "permission", "verify policy and required authorization; do not bypass controls"),
        (re.compile(r"connection refused|ECONNREFUSED", re.I), "dependency", "verify service health and dependency configuration"),
        (re.compile(r"SyntaxError|IndentationError", re.I), "syntax", "repair the reported syntax location before broader edits"),
        (re.compile(r"TypeError|AttributeError", re.I), "runtime", "inspect the final traceback frame and changed interface assumptions"),
    ]

    @staticmethod
    def _normalize(log: str) -> str:
        text = re.sub(r"0x[0-9a-fA-F]+", "0xADDR", log)
        text = re.sub(r"\b\d+(?:\.\d+)?s\b", "TIME", text)
        text = re.sub(r"/tmp/[^\s:]+", "/tmp/PATH", text)
        return text

    @classmethod
    def fingerprint(cls, log: str) -> str:
        normalized = cls._normalize(log)[-4000:]
        return hashlib.sha256(normalized.encode("utf-8", errors="replace")).hexdigest()[:16]

    @staticmethod
    def _traceback_tail(log: str) -> str | None:
        marker = log.rfind("Traceback (most recent call last):")
        if marker < 0:
            return None
        return log[marker:][-1800:].strip()

    def diagnose(self, log: str) -> FailureDiagnosis:
        clean = str(log or "")
        fingerprint = self.fingerprint(clean)
        traceback = self._traceback_tail(clean)
        for pattern, category, action in self.PATTERNS:
            match = pattern.search(clean)
            if match:
                start = max(0, match.start() - 240)
                end = min(len(clean), match.end() + 520)
                evidence = traceback or clean[start:end].strip()
                return FailureDiagnosis(category, evidence, action, fingerprint)
        tail = traceback or clean[-1200:].strip()
        return FailureDiagnosis(
            "unknown",
            tail,
            "inspect the smallest reproducible failing step before editing",
            fingerprint,
        )
