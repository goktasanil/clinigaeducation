import asyncio
import os

import pytest

from ai.integrations.domain_clients import ConfiguredHTTPService, domain_service_status


def test_domain_requirements_include_real_sdk_packages():
    text = open("ai/requirements-domain.txt", encoding="utf-8").read()
    for package in ("posthog", "meilisearch", "pyzotero", "google-search-results"):
        assert package in text


def test_domain_service_catalog_is_available_without_secrets():
    names = {status.name for status in domain_service_status()}
    assert {"posthog", "meilisearch", "zotero", "serpapi", "twenty-crm", "calcom", "trendyol-seller-growth"} <= names


def test_http_service_rejects_absolute_or_scheme_relative_paths(monkeypatch):
    monkeypatch.setenv("TEST_SERVICE_URL", "https://example.invalid")
    client = ConfiguredHTTPService("test", "TEST_SERVICE_URL")
    with pytest.raises(ValueError):
        asyncio.run(client.request("https://evil.invalid/path"))
    with pytest.raises(ValueError):
        asyncio.run(client.request("//evil.invalid/path"))


def test_http_service_write_requires_explicit_approval(monkeypatch):
    monkeypatch.setenv("TEST_SERVICE_URL", "https://example.invalid")
    client = ConfiguredHTTPService("test", "TEST_SERVICE_URL")
    with pytest.raises(PermissionError):
        asyncio.run(client.request("/items", method="POST", json={"x": 1}))


def test_trendyol_adapter_is_not_enabled_without_config(monkeypatch):
    monkeypatch.delenv("CLINIGA_TRENDYOL_API_URL", raising=False)
    monkeypatch.delenv("CLINIGA_TRENDYOL_API_TOKEN", raising=False)
    from ai.integrations import domain_clients

    client = domain_clients.ConfiguredHTTPService(
        "trendyol-seller-growth",
        "CLINIGA_TRENDYOL_API_URL",
        "CLINIGA_TRENDYOL_API_TOKEN",
    )
    assert client.enabled is False
