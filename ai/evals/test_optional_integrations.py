from ai.integrations.provider_registry import DEFAULT_PROVIDERS, list_provider_names
from ai.integrations.external_providers import (
    N8NProvider,
    OllamaProvider,
    StagehandProvider,
    crewai,
    dspy,
    haystack,
    llamaindex,
    pgvector,
    pydantic_ai,
    temporal,
)
from ai.integrations.litellm_gateway import LiteLLMGateway


def test_provider_registry_contains_expected_integrations():
    expected = {
        "litellm", "ollama", "gemini-cli", "llamaindex", "stagehand", "crewai", "n8n", "supabase",
        "haystack", "dspy", "qdrant", "pgvector", "pydantic-ai", "temporal", "opentelemetry", "helicone",
    }
    assert expected <= set(list_provider_names())
    assert all(DEFAULT_PROVIDERS[name].enabled is False for name in expected)


def test_external_providers_are_opt_in_by_default(monkeypatch):
    for name in [
        "CLINIGA_LITELLM_URL",
        "CLINIGA_LITELLM_API_KEY",
        "CLINIGA_OLLAMA_URL",
        "CLINIGA_STAGEHAND_ENDPOINT",
        "CLINIGA_N8N_WEBHOOK",
    ]:
        monkeypatch.delenv(name, raising=False)
    assert LiteLLMGateway().enabled is False
    assert OllamaProvider().enabled is False
    assert StagehandProvider().enabled is False
    assert N8NProvider().enabled is False


def test_optional_library_adapters_do_not_require_installation():
    for provider in (llamaindex, crewai, haystack, dspy, pydantic_ai, temporal, pgvector):
        assert isinstance(provider.enabled, bool)
