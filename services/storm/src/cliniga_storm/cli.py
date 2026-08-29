from __future__ import annotations

import argparse
import json
import os
from importlib.metadata import version

from .runtime import import_runner


def status() -> dict[str, object]:
    import_runner()

    return {
        "installed": True,
        "version": version("knowledge-storm"),
        "llm_configured": bool(os.environ.get("OPENAI_API_KEY", "").strip()),
        "search_configured": bool(os.environ.get("TAVILY_API_KEY", "").strip()),
        "mode": "research-draft",
    }


def main() -> None:
    parser = argparse.ArgumentParser(prog="cliniga-storm")
    parser.add_argument("command", choices=["status"])
    args = parser.parse_args()
    if args.command == "status":
        print(json.dumps(status(), ensure_ascii=False, indent=2))
