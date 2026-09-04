from __future__ import annotations

from dataclasses import dataclass
import subprocess
from pathlib import Path


@dataclass(frozen=True)
class TerminalCase:
    name: str
    command: list[str]
    cwd: str = "."
    timeout: int = 20


@dataclass(frozen=True)
class TerminalResult:
    name: str
    returncode: int
    stdout: str
    stderr: str


ALLOWED_BINARIES = {"python", "python3", "pytest", "git"}
FORBIDDEN_TOKENS = {"sudo", "ssh", "curl", "wget", "nc", "ncat", "bash", "sh"}


def validate_case(case: TerminalCase) -> None:
    if not case.command:
        raise ValueError("empty command")
    binary = Path(case.command[0]).name
    if binary not in ALLOWED_BINARIES:
        raise PermissionError(f"binary not allowed in benchmark harness: {binary}")
    joined = " ".join(case.command).lower()
    if any(token in joined.split() for token in FORBIDDEN_TOKENS):
        raise PermissionError("forbidden token in benchmark command")


def run_case(case: TerminalCase) -> TerminalResult:
    validate_case(case)
    completed = subprocess.run(
        case.command,
        cwd=case.cwd,
        text=True,
        capture_output=True,
        timeout=case.timeout,
        check=False,
    )
    return TerminalResult(case.name, completed.returncode, completed.stdout, completed.stderr)


def default_cases() -> list[TerminalCase]:
    return [
        TerminalCase("compile", ["python", "-m", "compileall", "ai"]),
        TerminalCase("agentic-tests", ["python", "-m", "pytest", "-q", "ai/evals/test_agentic_engineering.py"]),
    ]
