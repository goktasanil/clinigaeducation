from __future__ import annotations

import os
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path

CAPABILITIES = {
    "paper_qa": "paper-qa",
    "docling": "docling",
    "crawlee": "crawlee",
    "duckdb": "duckdb",
    "optuna": "optuna",
    "streamlit": "streamlit",
    "trendyol_seller_mcp": "trendyol-seller-mcp",
}


def capability_status() -> dict[str, object]:
    from .research import paperqa_ready

    packages: dict[str, dict[str, object]] = {}
    for capability, distribution in CAPABILITIES.items():
        try:
            installed_version = version(distribution)
        except PackageNotFoundError:
            packages[capability] = {"installed": False, "version": None}
        else:
            packages[capability] = {"installed": True, "version": installed_version}

    credentials_ready = all(
        os.environ.get(name, "").strip()
        for name in ("TRENDYOL_SELLER_ID", "TRENDYOL_API_KEY", "TRENDYOL_API_SECRET")
    )
    storm_python = _storm_python()
    return {
        "packages": packages,
        "storm": {
            "installed": storm_python is not None,
            "python": str(storm_python) if storm_python else None,
        },
        "research_provider_configured": bool(os.environ.get("OPENAI_API_KEY", "").strip()),
        "paperqa_runtime_ready": paperqa_ready(),
        "trendyol_credentials_configured": credentials_ready,
        "trendyol_mode": "read-only",
        "public_crawl_enabled": os.environ.get("CLINIGA_ALLOW_PUBLIC_CRAWL", "").lower()
        == "true",
    }


def missing_capabilities() -> list[str]:
    status = capability_status()
    packages = status["packages"]
    assert isinstance(packages, dict)
    missing = [name for name, item in packages.items() if not item["installed"]]
    if not status["paperqa_runtime_ready"]:
        missing.append("paperqa_runtime")
    storm = status["storm"]
    assert isinstance(storm, dict)
    if not storm["installed"]:
        missing.append("storm")
    return missing


def _storm_python() -> Path | None:
    services_dir = Path(__file__).resolve().parents[3]
    candidates = [
        services_dir / "storm" / ".venv" / "bin" / "python",
        services_dir / "storm" / ".venv" / "Scripts" / "python.exe",
    ]
    return next((candidate for candidate in candidates if candidate.is_file()), None)
