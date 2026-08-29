import pytest

from ai.agents.capability_router import CapabilityRouter
from ai.integrations.runtime_router import RuntimeProviderRouter


def test_provider_defaults_are_local(monkeypatch):
    for key in (
        "CLINIGA_LITELLM_URL",
        "CLINIGA_OLLAMA_URL",
        "CLINIGA_STAGEHAND_ENDPOINT",
        "CLINIGA_N8N_WEBHOOK",
    ):
        monkeypatch.delenv(key, raising=False)
    router = RuntimeProviderRouter()
    decision = router.decide("fix repository CI failure")
    assert decision.provider == "default"
    assert decision.mode == "llm"


def test_litellm_precedes_ollama(monkeypatch):
    monkeypatch.setenv("CLINIGA_LITELLM_URL", "http://litellm:4000/v1")
    monkeypatch.setenv("CLINIGA_OLLAMA_URL", "http://ollama:11434")
    router = RuntimeProviderRouter()
    assert router.decide("general reasoning").provider == "litellm"


def test_external_actions_require_explicit_prefix(monkeypatch):
    monkeypatch.setenv("CLINIGA_STAGEHAND_ENDPOINT", "http://stagehand:3000/run")
    monkeypatch.setenv("CLINIGA_N8N_WEBHOOK", "http://n8n:5678/webhook")
    router = RuntimeProviderRouter()
    assert router.decide("research this website").mode != "external_action"
    assert router.decide("browser: research this website").provider == "stagehand"
    assert router.decide("workflow: run approved workflow").provider == "n8n"


def test_provider_rejects_unapproved_outbound_host(monkeypatch):
    monkeypatch.setenv("CLINIGA_LITELLM_URL", "https://evil.example/v1")
    monkeypatch.delenv("CLINIGA_LLM_ALLOWED_HOSTS", raising=False)
    with pytest.raises(RuntimeError, match="not allowed"):
        RuntimeProviderRouter()


def test_capabilities_survive_provider_routing_without_loading_heavy_optional_runtime():
    caps = set(
        CapabilityRouter().choose(
            "fix repo issue after pytest failure",
            has_context=True,
            has_test_log=True,
        ).capabilities
    )
    assert "repo_engineering" in caps
    assert "patch_editing" in caps
    assert "hierarchical_context" in caps
    assert "test_failure_diagnosis" in caps
    assert "issue_execution_loop" in caps
