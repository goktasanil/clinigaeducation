from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

ALLOWED_ROLES = {"system", "user", "assistant"}

SECRET_PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "OpenAI-style API key": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b"),
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
}

PII_PATTERNS = {
    "email address": re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I),
    "possible phone number": re.compile(r"(?<!\d)(?:\+?\d[\s().-]?){9,15}(?!\d)"),
}


@dataclass
class ValidationReport:
    records: list[dict[str, Any]] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    fingerprint: str = ""

    @property
    def ok(self) -> bool:
        return not self.errors


def canonical_record(record: dict[str, Any]) -> str:
    return json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def dataset_fingerprint(records: Iterable[dict[str, Any]]) -> str:
    digest = hashlib.sha256()
    for record in records:
        digest.update(canonical_record(record).encode("utf-8"))
        digest.update(b"\n")
    return digest.hexdigest()


def _validate_record(record: Any, line_number: int) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    prefix = f"line {line_number}"

    if not isinstance(record, dict):
        return [f"{prefix}: record must be a JSON object"], warnings
    if set(record) != {"messages"}:
        errors.append(f"{prefix}: only the 'messages' field is allowed")
        return errors, warnings
    messages = record.get("messages")
    if not isinstance(messages, list) or len(messages) < 2:
        errors.append(f"{prefix}: messages must contain at least two entries")
        return errors, warnings

    for index, message in enumerate(messages):
        location = f"{prefix}, message {index + 1}"
        if not isinstance(message, dict) or set(message) != {"role", "content"}:
            errors.append(f"{location}: expected exactly role and content")
            continue
        role = message.get("role")
        content = message.get("content")
        if role not in ALLOWED_ROLES:
            errors.append(f"{location}: invalid role {role!r}")
        if not isinstance(content, str) or not content.strip():
            errors.append(f"{location}: content must be a non-empty string")
            continue
        for label, pattern in SECRET_PATTERNS.items():
            if pattern.search(content):
                errors.append(f"{location}: possible {label} detected")
        for label, pattern in PII_PATTERNS.items():
            if pattern.search(content):
                warnings.append(f"{location}: possible {label}; verify rights and necessity")

    if isinstance(messages[-1], dict) and messages[-1].get("role") != "assistant":
        errors.append(f"{prefix}: final message must be an assistant response")
    if not any(isinstance(item, dict) and item.get("role") == "user" for item in messages):
        errors.append(f"{prefix}: at least one user message is required")
    return errors, warnings


def validate_jsonl(path: str | Path) -> ValidationReport:
    report = ValidationReport()
    seen: dict[str, int] = {}

    with Path(path).open(encoding="utf-8") as handle:
        for line_number, raw_line in enumerate(handle, start=1):
            if not raw_line.strip():
                continue
            try:
                record = json.loads(raw_line)
            except json.JSONDecodeError as exc:
                report.errors.append(f"line {line_number}: invalid JSON: {exc.msg}")
                continue

            errors, warnings = _validate_record(record, line_number)
            report.errors.extend(errors)
            report.warnings.extend(warnings)
            if errors:
                continue
            canonical = canonical_record(record)
            if canonical in seen:
                report.warnings.append(
                    f"line {line_number}: duplicate of line {seen[canonical]} was removed"
                )
                continue
            seen[canonical] = line_number
            report.records.append(record)

    if not report.records:
        report.errors.append("dataset contains no valid records")
    report.fingerprint = dataset_fingerprint(report.records)
    return report


def to_prompt_completion(record: dict[str, Any]) -> dict[str, Any]:
    messages = record["messages"]
    return {"prompt": messages[:-1], "completion": [messages[-1]]}


def overlapping_records(
    train_records: Iterable[dict[str, Any]], eval_records: Iterable[dict[str, Any]]
) -> int:
    train = {canonical_record(record) for record in train_records}
    return sum(canonical_record(record) in train for record in eval_records)

