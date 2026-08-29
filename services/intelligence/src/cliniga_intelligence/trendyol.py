from __future__ import annotations

import os
from typing import Any

from trendyol_seller_mcp.client import (
    DEFAULT_BASE_URL,
    STAGE_BASE_URL,
    TrendyolClient,
    TrendyolConfig,
)


def readonly_client_from_env() -> TrendyolClient:
    if os.environ.get("TRENDYOL_ALLOW_WRITES", "").lower() == "true":
        raise PermissionError("The analytics adapter refuses to start when writes are enabled")
    config = TrendyolConfig.from_env()
    requested_base = os.environ.get("TRENDYOL_BASE_URL", "").strip().rstrip("/")
    config.base_url = requested_base or STAGE_BASE_URL
    if config.base_url not in {STAGE_BASE_URL, DEFAULT_BASE_URL}:
        raise PermissionError("Only the official Trendyol stage or production gateway is allowed")
    return TrendyolClient(config)


def list_products(*, page: int = 0, size: int = 50) -> dict[str, Any]:
    client = readonly_client_from_env()
    try:
        return client.get_products({"page": max(page, 0), "size": min(max(size, 1), 200)})
    finally:
        client.close()


def list_orders(*, page: int = 0, size: int = 50) -> dict[str, Any]:
    client = readonly_client_from_env()
    try:
        return client.get_orders({"page": max(page, 0), "size": min(max(size, 1), 200)})
    finally:
        client.close()
