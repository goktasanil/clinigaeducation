from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

from .data import validate_jsonl


def write_jsonl(path: Path, records: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate and split conversational JSONL data")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--eval-ratio", type=float, default=0.1)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    if not 0 < args.eval_ratio < 0.5:
        parser.error("--eval-ratio must be greater than 0 and less than 0.5")

    report = validate_jsonl(args.input)
    for warning in report.warnings:
        print(f"WARNING: {warning}")
    if report.errors:
        for error in report.errors:
            print(f"ERROR: {error}")
        raise SystemExit(2)
    if len(report.records) < 2:
        raise SystemExit("At least two valid records are required for a split")

    records = list(report.records)
    random.Random(args.seed).shuffle(records)
    eval_count = max(1, round(len(records) * args.eval_ratio))
    eval_records = records[:eval_count]
    train_records = records[eval_count:]

    output_dir = Path(args.output_dir)
    write_jsonl(output_dir / "train.jsonl", train_records)
    write_jsonl(output_dir / "eval.jsonl", eval_records)
    print(
        json.dumps(
            {
                "train_records": len(train_records),
                "eval_records": len(eval_records),
                "source_fingerprint": report.fingerprint,
                "warnings": len(report.warnings),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

