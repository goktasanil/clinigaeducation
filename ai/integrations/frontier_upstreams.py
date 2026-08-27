from __future__ import annotations

import json
from pathlib import Path
from typing import Any


MANIFEST_PATH = Path(__file__).resolve().parents[1] / "security" / "frontier_upstreams.json"


def load_manifest() -> dict[str, Any]:
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def components() -> list[dict[str, Any]]:
    return list(load_manifest()["components"])


def repositories() -> list[str]:
    return [item["repository"] for item in components()]


def installable_packages() -> list[str]:
    """Return packages approved for the optional adapter worker."""
    return [
        item["package"]
        for item in components()
        if item.get("package") and item["status"] == "approved-optional-adapter"
    ]


def isolated_providers() -> list[str]:
    return [
        item["provider"]
        for item in components()
        if "isolated" in item["status"]
    ]
