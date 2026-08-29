from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from ai.integrations.expert_delegation import ExpertDelegator

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


def test_compose_only_publicly_exposes_primary_api(monkeypatch):
    monkeypatch.setenv("CLINIGA_POSTGRES_PASSWORD", "test-password")
    monkeypatch.setenv("CLINIGA_S3_ACCESS_KEY", "test-access")
    monkeypatch.setenv("CLINIGA_S3_SECRET_KEY", "test-secret")
    data = yaml.safe_load((ROOT / "ai/docker-compose.yml").read_text(encoding="utf-8"))
    services = data["services"]
    assert "ports" in services["api"]
    for name, service in services.items():
        if name == "api":
            continue
        assert "ports" not in service, f"{name} unexpectedly publishes a host port"


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
