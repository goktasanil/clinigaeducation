import os

from ai.integrations import advanced_optional_providers as adv
from ai.integrations.provider_registry import DEFAULT_PROVIDERS


def test_advanced_providers_registered_and_disabled_by_default(monkeypatch):
    expected = {"haystack", "dspy", "pydantic-ai", "temporal", "dagster", "helicone"}
    assert expected <= set(DEFAULT_PROVIDERS)
    assert all(DEFAULT_PROVIDERS[name].enabled is False for name in expected)

    for env_name in (
        "CLINIGA_ENABLE_HAYSTACK",
        "CLINIGA_ENABLE_DSPY",
        "CLINIGA_ENABLE_PYDANTIC_AI",
        "CLINIGA_ENABLE_TEMPORAL",
        "CLINIGA_ENABLE_DAGSTER",
    ):
        monkeypatch.delenv(env_name, raising=False)

    assert adv.haystack.enabled is False
    assert adv.dspy.enabled is False
    assert adv.pydantic_ai.enabled is False
    assert adv.temporal.enabled is False
    assert adv.dagster.enabled is False


def test_helicone_requires_endpoint_and_secret(monkeypatch):
    monkeypatch.setenv("CLINIGA_HELICONE_URL", "https://example.invalid")
    monkeypatch.setenv("CLINIGA_HELICONE_API_KEY_ENV", "TEST_HELICONE_KEY")
    monkeypatch.delenv("TEST_HELICONE_KEY", raising=False)
    cfg = adv.HeliconeConfig()
    assert cfg.enabled is False

    monkeypatch.setenv("TEST_HELICONE_KEY", "dummy")
    cfg = adv.HeliconeConfig()
    assert cfg.enabled is True
