from __future__ import annotations

import hashlib
import json
import mimetypes
import os
import re
import subprocess
from collections import Counter
from pathlib import Path

import yaml

from .registry import Skill, registry

_ALLOWED_ROOT = Path.cwd().resolve()
_MAX_OUTPUT = 20000


def _resolve_local_target(path: str) -> Path:
    target = (Path.cwd() / path).resolve()
    if target != _ALLOWED_ROOT and _ALLOWED_ROOT not in target.parents:
        raise PermissionError("Security analysis is limited to the authorized local workspace")
    if not target.exists():
        raise FileNotFoundError(target)
    return target


def _run(command: list[str], cwd: Path, timeout: int = 180, env: dict[str, str] | None = None) -> dict:
    proc = subprocess.run(command, cwd=str(cwd), capture_output=True, text=True, timeout=timeout, check=False, env=env)
    return {"command": command[0], "returncode": proc.returncode, "stdout": proc.stdout[-_MAX_OUTPUT:], "stderr": proc.stderr[-10000:]}


def generate_sbom(path: str = ".") -> dict:
    target = _resolve_local_target(path)
    if not target.is_dir():
        raise ValueError("SBOM generation requires a directory")
    try:
        result = _run(["syft", f"dir:{target}", "-o", "cyclonedx-json"], target)
    except FileNotFoundError:
        return {"target": str(target), "tool": "syft", "status": "not-installed"}
    if result["returncode"] != 0:
        return {"target": str(target), "tool": "syft", "status": "failed", "stderr": result["stderr"]}
    try:
        doc = json.loads(result["stdout"])
    except json.JSONDecodeError:
        return {"target": str(target), "tool": "syft", "status": "invalid-json"}
    components = doc.get("components") or []
    return {"target": str(target), "tool": "syft", "status": "ok", "format": doc.get("bomFormat"), "spec_version": doc.get("specVersion"), "component_count": len(components), "components": [{"name": item.get("name"), "version": item.get("version"), "type": item.get("type")} for item in components[:100]], "truncated": len(components) > 100}


def scan_vulnerabilities(path: str = ".") -> dict:
    target = _resolve_local_target(path)
    if not target.is_dir():
        raise ValueError("Vulnerability scanning requires a directory")
    env = os.environ.copy()
    env["GRYPE_DB_AUTO_UPDATE"] = "true" if os.getenv("CLINIGA_SECURITY_ALLOW_DB_UPDATE", "false").lower() == "true" else "false"
    try:
        result = _run(["grype", f"dir:{target}", "-o", "json"], target, env=env)
    except FileNotFoundError:
        return {"target": str(target), "tool": "grype", "status": "not-installed"}
    if result["returncode"] not in {0, 1}:
        return {"target": str(target), "tool": "grype", "status": "failed", "stderr": result["stderr"]}
    try:
        doc = json.loads(result["stdout"])
    except json.JSONDecodeError:
        return {"target": str(target), "tool": "grype", "status": "invalid-json", "stderr": result["stderr"]}
    matches = doc.get("matches") or []
    severities = Counter(str((m.get("vulnerability") or {}).get("severity") or "Unknown") for m in matches)
    findings = []
    for match in matches[:100]:
        vulnerability = match.get("vulnerability") or {}
        artifact = match.get("artifact") or {}
        findings.append({"id": vulnerability.get("id"), "severity": vulnerability.get("severity"), "package": artifact.get("name"), "version": artifact.get("version"), "fix_versions": ((vulnerability.get("fix") or {}).get("versions") or [])[:10]})
    return {"target": str(target), "tool": "grype", "status": "ok", "finding_count": len(matches), "by_severity": dict(severities), "findings": findings, "truncated": len(matches) > 100}


def artifact_static_triage(path: str, yara_rules: str = "ai/security/yara") -> dict:
    target = _resolve_local_target(path)
    if not target.is_file():
        raise ValueError("Artifact triage requires a file")
    digest = hashlib.sha256()
    with target.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    report = {"target": str(target), "mode": "static-only", "size_bytes": target.stat().st_size, "sha256": digest.hexdigest(), "mime_guess": mimetypes.guess_type(target.name)[0] or "application/octet-stream", "suffix": target.suffix.lower()}
    rules = _resolve_local_target(yara_rules) if (Path.cwd() / yara_rules).exists() else None
    if rules is None:
        report["yara"] = {"status": "rules-not-configured"}
        return report
    try:
        result = _run(["yara", "-r", str(rules), str(target)], target.parent, timeout=60)
    except FileNotFoundError:
        report["yara"] = {"status": "not-installed"}
        return report
    report["yara"] = {"status": "ok" if result["returncode"] in {0, 1} else "failed", "matches": [line for line in result["stdout"].splitlines() if line.strip()][:200], "stderr": result["stderr"] if result["returncode"] not in {0, 1} else ""}
    return report


def validate_sigma_rules(path: str = "ai/security/sigma") -> dict:
    target = _resolve_local_target(path)
    files = [target] if target.is_file() else sorted([*target.rglob("*.yml"), *target.rglob("*.yaml")])
    findings: list[dict] = []
    valid = 0
    for file in files[:1000]:
        try:
            docs = list(yaml.safe_load_all(file.read_text(encoding="utf-8")))
        except Exception as exc:
            findings.append({"file": str(file), "valid": False, "errors": [f"yaml: {type(exc).__name__}"]})
            continue
        for index, rule in enumerate(docs):
            errors: list[str] = []
            if not isinstance(rule, dict):
                errors.append("rule must be a mapping")
            else:
                for field in ("title", "logsource", "detection"):
                    if not rule.get(field):
                        errors.append(f"missing {field}")
                detection = rule.get("detection") if isinstance(rule.get("detection"), dict) else {}
                if not detection.get("condition"):
                    errors.append("missing detection.condition")
            if not errors:
                valid += 1
            findings.append({"file": str(file), "document": index, "valid": not errors, "errors": errors})
    return {"target": str(target), "mode": "validation-only", "rules_valid": valid, "rules_checked": len(findings), "findings": findings[:1000], "truncated": len(findings) > 1000}


def extract_iocs(text: str) -> dict:
    if len(text) > 200000:
        raise ValueError("IOC extraction input is too large")
    urls = sorted(set(re.findall(r"https?://[^\s<>\"']+", text, flags=re.IGNORECASE)))
    ipv4 = sorted(set(re.findall(r"\b(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\b", text)))
    sha256 = sorted(set(re.findall(r"\b[a-fA-F0-9]{64}\b", text)))
    domains = sorted(set(re.findall(r"\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}\b", text)))
    return {"urls": urls[:500], "ipv4": ipv4[:500], "sha256": sha256[:500], "domains": domains[:500], "mode": "extract-only-no-probing"}


registry.register(Skill(name="security.generate_sbom", description="Generate a local CycloneDX SBOM with Syft for the authorized workspace.", handler=generate_sbom))
registry.register(Skill(name="security.scan_vulnerabilities", description="Identify known dependency/package vulnerabilities with Grype on the authorized local workspace only.", handler=scan_vulnerabilities))
registry.register(Skill(name="security.artifact_triage", description="Perform static-only hash, metadata and optional YARA analysis of an authorized local artifact.", handler=artifact_static_triage))
registry.register(Skill(name="security.validate_sigma", description="Validate local Sigma detection-rule structure without executing remote queries.", handler=validate_sigma_rules))
registry.register(Skill(name="security.extract_iocs", description="Extract defensive indicators from provided text without enrichment, probing or exploitation.", handler=extract_iocs))
