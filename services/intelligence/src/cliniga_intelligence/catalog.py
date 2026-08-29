from __future__ import annotations

import csv
from pathlib import Path

import duckdb

from .economics import ProductEconomics, optimize_sale_price

REQUIRED_COLUMNS = {"name", "market_price"}
RESULT_COLUMNS = (
    "name",
    "market_price",
    "purchase_price",
    "sustainable_floor",
    "recommended_price",
    "unit_profit",
    "expected_monthly_profit",
)


def rank_csv(source: str | Path, destination: str | Path) -> list[dict[str, object]]:
    source_path = Path(source)
    with source_path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames or not REQUIRED_COLUMNS.issubset(reader.fieldnames):
            raise ValueError("CSV must contain name and market_price columns")
        results = []
        for row in reader:
            product = ProductEconomics(
                name=row["name"].strip(),
                market_price=float(row["market_price"]),
                purchase_discount=float(row.get("purchase_discount") or 0.30),
                shipping_cost=float(row.get("shipping_cost") or 85),
                commission_rate=float(row.get("commission_rate") or 0.20),
                tax_reserve_rate=float(row.get("tax_reserve_rate") or 0.08),
                inflation_reserve_rate=float(row.get("inflation_reserve_rate") or 0.05),
                target_margin_rate=float(row.get("target_margin_rate") or 0.15),
            )
            results.append(optimize_sale_price(product, trials=30))

    connection = duckdb.connect()
    connection.execute(
        """
        create table ranked_products (
          name varchar, market_price double, purchase_price double,
          sustainable_floor double, recommended_price double,
          unit_profit double, expected_monthly_profit double
        )
        """
    )
    connection.executemany(
        "insert into ranked_products values (?, ?, ?, ?, ?, ?, ?)",
        [[item[key] for key in RESULT_COLUMNS] for item in results],
    )
    ordered = connection.execute(
        "select * from ranked_products order by expected_monthly_profit desc"
    ).fetchall()
    columns = [item[0] for item in connection.description]
    ranked = [dict(zip(columns, row, strict=True)) for row in ordered]
    destination_path = Path(destination)
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    with destination_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        writer.writerows(ranked)
    connection.close()
    return ranked
