from __future__ import annotations

import csv
from pathlib import Path

from cliniga_intelligence.catalog import rank_csv


def test_rank_csv_runs_end_to_end_and_exports_ranked_output(tmp_path: Path) -> None:
    source = tmp_path / "products.csv"
    destination = tmp_path / "ranked.csv"
    source.write_text(
        "name,market_price,shipping_cost\nTest ürünü,1000,70\n",
        encoding="utf-8",
    )

    ranked = rank_csv(source, destination)

    assert len(ranked) == 1
    assert ranked[0]["name"] == "Test ürünü"
    assert ranked[0]["recommended_price"] >= ranked[0]["sustainable_floor"]
    with destination.open(encoding="utf-8", newline="") as handle:
        exported = list(csv.DictReader(handle))
    assert exported[0]["name"] == "Test ürünü"
