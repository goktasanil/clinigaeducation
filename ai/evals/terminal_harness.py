from __future__ import annotations

import os
import subprocess
import tempfile
from dataclasses import dataclass
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


REPO_ROOT = Path(__file__).resolve().parents[2]
MAX_OUTPUT_CHARS = 200_000
MAX_TIMEOUT_SECONDS = 60
ALLOWED_ENV_KEYS = {"PATH", "LANG", "LC_ALL", "PYTHONPATH"}


def _safe_cwd(value: str) -> Path:
    candidate = (REPO_ROOT / value).resolve() if not Path(value).is_absolute() else Path(value).resolve()
    try:
        candidate.relative_to(REPO_ROOT)
    except ValueError as exc:
        raise PermissionError("terminal harness cwd must stay inside repository root") from exc
    if not candidate.exists() or not candidate.is_dir():
        raise ValueError("terminal harness cwd does not exist")
    return candidate


def _validate_python(command: list[str]) -> None:
    if len(command) < 3 or command[1] != "-m":
        raise PermissionError("python harness commands must use an approved -m module")
    module = command[2]
    if module not in {"compileall", "pytest"}:
        raise PermissionError(f"python module not allowed in benchmark harness: {module}")
    if module == "compileall":
        if command[3:] != ["ai"]:
            raise PermissionError("compileall is restricted to the ai tree")
        return
    allowed_flags = {"-q", "-x", "--maxfail=1", "--disable-warnings"}
    for arg in command[3:]:
        if arg.startswith("-"):
            if arg not in allowed_flags:
                raise PermissionError(f"pytest option not allowed: {arg}")
            continue
        target = (REPO_ROOT / arg).resolve()
        try:
            target.relative_to(REPO_ROOT / "ai")
        except ValueError as exc:
            raise PermissionError("pytest target must stay inside ai/") from exc


def validate_case(case: TerminalCase) -> None:
    if not case.command:
        raise ValueError("empty command")
    if not 1 <= int(case.timeout) <= MAX_TIMEOUT_SECONDS:
        raise ValueError("terminal harness timeout out of bounds")
    _safe_cwd(case.cwd)
    binary = Path(case.command[0]).name
    if binary not in {"python", "python3"}:
        raise PermissionError(f"binary not allowed in benchmark harness: {binary}")
    _validate_python(case.command)


def _sanitized_env(temp_root: Path) -> dict[str, str]:
    env = {key: value for key, value in os.environ.items() if key in ALLOWED_ENV_KEYS}
    env.setdefault("PYTHONPATH", str(REPO_ROOT))
    home = temp_root / "home"
    home.mkdir(mode=0o700, parents=True, exist_ok=True)
    env["HOME"] = str(home)
    env["TMPDIR"] = str(temp_root)
    return env


def _cap(text: str) -> str:
    if len(text) <= MAX_OUTPUT_CHARS:
        return text
    return text[:MAX_OUTPUT_CHARS] + "\n...[output truncated]"


def run_case(case: TerminalCase) -> TerminalResult:
    validate_case(case)
    with tempfile.TemporaryDirectory(prefix="cliniga-terminal-") as temp_dir:
        temp_root = Path(temp_dir)
        completed = subprocess.run(
            case.command,
            cwd=_safe_cwd(case.cwd),
            env=_sanitized_env(temp_root),
            text=True,
            capture_output=True,
            timeout=case.timeout,
            check=False,
            shell=False,
            stdin=subprocess.DEVNULL,
        )
    return TerminalResult(
        case.name,
        completed.returncode,
        _cap(completed.stdout),
        _cap(completed.stderr),
    )


def default_cases() -> list[TerminalCase]:
    return [
        TerminalCase("compile", ["python", "-m", "compileall", "ai"]),
        TerminalCase(
            "agentic-tests",
            ["python", "-m", "pytest", "-q", "ai/evals/test_agentic_engineering.py"],
        ),
    ]
