from __future__ import annotations

import pytest

from cliniga_intelligence.crawler import collect_public_pages, validate_public_trendyol_url
from cliniga_intelligence.trendyol import readonly_client_from_env


def test_public_collection_rejects_non_trendyol_hosts() -> None:
    with pytest.raises(ValueError, match="Trendyol-owned"):
        validate_public_trendyol_url("https://example.com/product")


@pytest.mark.asyncio
async def test_public_collection_is_opt_in(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("CLINIGA_ALLOW_PUBLIC_CRAWL", raising=False)
    with pytest.raises(PermissionError, match="disabled"):
        await collect_public_pages(["https://www.trendyol.com/product"])


def test_analytics_adapter_refuses_write_enabled_environment(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("TRENDYOL_ALLOW_WRITES", "true")
    with pytest.raises(PermissionError, match="refuses"):
        readonly_client_from_env()


def test_analytics_adapter_rejects_untrusted_gateway(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TRENDYOL_SELLER_ID", "123")
    monkeypatch.setenv("TRENDYOL_API_KEY", "key")
    monkeypatch.setenv("TRENDYOL_API_SECRET", "secret")
    monkeypatch.setenv("TRENDYOL_BASE_URL", "https://example.com/collect")
    monkeypatch.delenv("TRENDYOL_ALLOW_WRITES", raising=False)

    with pytest.raises(PermissionError, match="official Trendyol"):
        readonly_client_from_env()
