from __future__ import annotations

import json
import subprocess
from pathlib import Path

from .registry import Skill, registry

_ALLOWED_ROOT = Path.cwd().resolve()


def _resolve_local_target(path: str) -> Path:
    target = (Path.cwd() / path).resolve()
    if target != _ALLOWED_ROOT and _ALLOWED_ROOT not in target.parents:
        raise PermissionError("Security scanning is limited to the local authorized workspace")
    if not target.exists():
        raise FileNotFoundError(target)
    return target


def _run(command: list[str], cwd: Path, timeout: int = 180) -> dict:
    proc = subprocess.run(
        command,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )
    return {
        "command": command[0],
        "returncode": proc.returncode,
        "stdout": proc.stdout[-20000:],
        "stderr": proc.stderr[-10000:],
    }


def scan_local_repo(path: str = ".") -> dict:
    """Run defensive checks only against an authorized local workspace.

    Tools are optional; missing binaries are reported rather than installed or
    fetched automatically. This skill does not scan arbitrary remote hosts.
    """
    target = _resolve_local_target(path)
    checks: list[dict] = []
    commands = [
        ["semgrep", "scan", "--config", "auto", "--json", "."],
        ["bandit", "-r", "ai", "-f", "json"],
        ["detect-secrets", "scan", "--all-files"],
        ["gitleaks", "detect", "--source", ".", "--no-banner", "--report-format", "json"],
        ["trivy", "fs", "--quiet", "--format", "json", "."],
        ["osv-scanner", "scan", "source", "-r", ".", "--format", "json"],
    ]
    for command in commands:
        try:
            checks.append(_run(command, target))
        except FileNotFoundError:
            checks.append({"command": command[0], "status": "not-installed"})
        except subprocess.TimeoutExpired:
            checks.append({"command": command[0], "status": "timeout"})

    return {
        "target": str(target),
        "mode": "defensive-local-only",
        "checks": checks,
    }


registry.register(Skill(
    name="security.scan_local_repo",
    description="Run defensive SAST, secret, dependency and filesystem scans on the authorized local workspace only.",
    handler=scan_local_repo,
))
