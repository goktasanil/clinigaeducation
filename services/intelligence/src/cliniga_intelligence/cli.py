from __future__ import annotations

import argparse
import json
from pathlib import Path

from .catalog import rank_csv
from .health import capability_status, missing_capabilities
from .research import extract_markdown


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="cliniga-intelligence")
    subparsers = parser.add_subparsers(dest="command", required=True)

    status = subparsers.add_parser("status", help="Show installed capabilities without secrets")
    status.add_argument("--strict", action="store_true")

    rank = subparsers.add_parser("rank-csv", help="Rank products by sustainable expected profit")
    rank.add_argument("source", type=Path)
    rank.add_argument("destination", type=Path)

    extract = subparsers.add_parser("extract", help="Convert a thesis source to Markdown")
    extract.add_argument("source", type=Path)
    extract.add_argument("destination", type=Path)
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if args.command == "status":
        print(json.dumps(capability_status(), ensure_ascii=False, indent=2))
        missing = missing_capabilities()
        if args.strict and missing:
            raise SystemExit(f"Missing capabilities: {', '.join(missing)}")
        return
    if args.command == "rank-csv":
        ranked = rank_csv(args.source, args.destination)
        print(json.dumps(ranked, ensure_ascii=False, indent=2))
        return
    if args.command == "extract":
        markdown = extract_markdown(args.source)
        args.destination.parent.mkdir(parents=True, exist_ok=True)
        args.destination.write_text(markdown, encoding="utf-8")
        print(args.destination)
        return
    raise SystemExit("Unknown command")
