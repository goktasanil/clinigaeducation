from ai.integrations.fable_targeting import repositories
from ai.integrations.provider_registry import DEFAULT_PROVIDERS


def test_fable_targeting_upstreams_are_registered_and_opt_in():
    expected = {
        "alainbrown/openfable",
        "SWE-agent/SWE-agent",
        "OpenHands/OpenHands",
        "Aider-AI/aider",
    }
    assert set(repositories()) == expected

    for provider in ("openfable", "swe-agent", "openhands", "aider"):
        spec = DEFAULT_PROVIDERS[provider]
        assert spec.enabled is False
        assert spec.requires_approval_for_writes is True

    assert DEFAULT_PROVIDERS["openfable"].kind == "rag"
    for provider in ("swe-agent", "openhands", "aider"):
        assert DEFAULT_PROVIDERS[provider].kind == "coding_agent"
