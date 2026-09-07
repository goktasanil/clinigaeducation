from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from ai.integrations.domain_clients import ConfiguredHTTPService, MeilisearchClient, PostHogClient
from ai.integrations.expert_delegation import ExpertDelegator
from ai.runtime.llm_client import OpenAICompatibleLLM
from ai.security.url_policy import validate_outbound_url

ROOT = Path(__file__).resolve().parents[2]


def test_expert_delegation_rejects_unapproved_host(monkeypatch):
    monkeypatch.setenv("CLINIGA_RUNTIME_PROFILE", "core")
    monkeypatch.setenv("CLINIGA_INTERNAL_SERVICE_TOKEN", "unit-test-token")
    monkeypatch.setenv("CLINIGA_RESEARCH_API_URL", "https://evil.example")
    monkeypatch.delenv("CLINIGA_EXPERT_ALLOWED_HOSTS", raising=False)
    delegator = ExpertDelegator()
    with pytest.raises(RuntimeError, match="not allowed"):
        delegator._target("tez literature systematic review")


def test_expert_delegation_accepts_internal_service(monkeypatch):
    monkeypatch.setenv("CLINIGA_RUNTIME_PROFILE", "core")
    monkeypatch.setenv("CLINIGA_INTERNAL_SERVICE_TOKEN", "unit-test-token")
    monkeypatch.setenv("CLINIGA_RESEARCH_API_URL", "http://research-api:8000")
    monkeypatch.delenv("CLINIGA_EXPERT_ALLOWED_HOSTS", raising=False)
    delegator = ExpertDelegator()
    assert delegator._target("tez literature systematic review") == (
        "research",
        "http://research-api:8000",
    )


def test_outbound_url_policy_rejects_embedded_credentials_and_plain_external_http():
    with pytest.raises(RuntimeError, match="credentials"):
        validate_outbound_url(
            "https://user:pass@example.com/api",
            allowed_hosts={"example.com"},
        )
    with pytest.raises(RuntimeError, match="HTTPS"):
        validate_outbound_url(
            "http://example.com/api",
            allowed_hosts={"example.com"},
        )


def test_primary_llm_rejects_unapproved_host(monkeypatch):
    monkeypatch.delenv("CLINIGA_LLM_ALLOWED_HOSTS", raising=False)
    with pytest.raises(RuntimeError, match="not allowed"):
        OpenAICompatibleLLM(base_url="https://evil.example/v1", api_key="test")


def test_domain_http_service_requires_host_allowlist(monkeypatch):
    monkeypatch.setenv("TEST_DOMAIN_URL", "https://crm.example/api")
    monkeypatch.setenv("TEST_DOMAIN_TOKEN", "unit-test-secret")
    monkeypatch.delenv("CLINIGA_DOMAIN_ALLOWED_HOSTS", raising=False)
    with pytest.raises(RuntimeError, match="not allowed"):
        ConfiguredHTTPService("test", "TEST_DOMAIN_URL", "TEST_DOMAIN_TOKEN")

    monkeypatch.setenv("CLINIGA_DOMAIN_ALLOWED_HOSTS", "crm.example")
    service = ConfiguredHTTPService("test", "TEST_DOMAIN_URL", "TEST_DOMAIN_TOKEN")
    assert service.enabled is True
    assert service.base_url == "https://crm.example/api"


def test_internal_meilisearch_and_official_posthog_hosts_are_allowed(monkeypatch):
    monkeypatch.setenv("CLINIGA_MEILISEARCH_URL", "http://meilisearch:7700")
    monkeypatch.delenv("CLINIGA_DOMAIN_ALLOWED_HOSTS", raising=False)
    assert MeilisearchClient().enabled is True
    monkeypatch.setenv("CLINIGA_POSTHOG_HOST", "https://us.i.posthog.com")
    PostHogClient()


def test_custom_runtime_dockerfiles_end_as_non_root():
    paths = [
        "ai/docker/Dockerfile.core",
        "ai/docker/Dockerfile.research",
        "ai/docker/Dockerfile.clinical",
        "ai/docker/Dockerfile.biomed",
        "ai/docker/Dockerfile.privacy",
        "ai/docker/Dockerfile.cdisc",
        "ai/biomed_agent/Dockerfile",
        "ai/commerce/trendyol/Dockerfile",
        "ai/pipelines/Dockerfile",
        "ai/quality/Dockerfile",
        "ai/standards/Dockerfile",
    ]
    for relative in paths:
        lines = (ROOT / relative).read_text(encoding="utf-8").splitlines()
        users = [line.split(None, 1)[1].strip() for line in lines if line.strip().upper().startswith("USER ")]
        assert users, f"{relative} has no USER directive"
        assert users[-1].lower() not in {"root", "0", "0:0"}, relative


def test_compose_only_publicly_exposes_primary_api():
    data = yaml.safe_load((ROOT / "ai/docker-compose.yml").read_text(encoding="utf-8"))
    services = data["services"]
    assert "ports" in services["api"]
    for name, service in services.items():
        if name == "api":
            continue
        assert "ports" not in service, f"{name} unexpectedly publishes a host port"


def test_compose_has_no_insecure_database_or_object_store_default_passwords():
    source = (ROOT / "ai/docker-compose.yml").read_text(encoding="utf-8")
    assert "${CLINIGA_POSTGRES_PASSWORD:?" in source
    assert "${CLINIGA_S3_ACCESS_KEY:?" in source
    assert "${CLINIGA_S3_SECRET_KEY:?" in source
    assert "minioadmin" not in source


def test_trendyol_bridge_requires_service_auth_and_write_approval():
    source = (ROOT / "ai/commerce/trendyol/server.mjs").read_text(encoding="utf-8")
    assert "CLINIGA_TRENDYOL_API_TOKEN" in source
    assert "requireServiceAuth(req, res)" in source
    assert "crypto.timingSafeEqual" in source
    assert "requireApproval(req, res)" in source
    assert source.index("requireServiceAuth(req, res)") < source.index("url.pathname === '/orders'")
    assert source.index("requireApproval(req, res)") < source.index("client.createProductV2")


def test_compose_passes_trendyol_service_token_to_bridge():
    source = (ROOT / "ai/docker-compose.yml").read_text(encoding="utf-8")
    assert "CLINIGA_TRENDYOL_API_TOKEN: ${CLINIGA_TRENDYOL_API_TOKEN:-}" in source
    assert "CLINIGA_EXPERT_ALLOWED_HOSTS" in source
