from ai.integrations.provider_registry import DEFAULT_PROVIDERS
from ai.integrations.upstream_catalog import list_upstreams


def test_high_value_upstreams_are_cataloged_without_duplicate_ragas_install():
    rows = list_upstreams()
    repos = {row['repo'] for row in rows}
    assert 'microsoft/autogen' in repos
    assert 'huggingface/smolagents' in repos
    assert 'openai/evals' in repos
    assert 'Arize-ai/phoenix' in repos
    assert 'guardrails-ai/guardrails' in repos
    assert 'confident-ai/deepeval' in repos
    ragas = next(row for row in rows if row['repo'] == 'vibrantlabsai/ragas')
    assert ragas['integration_mode'] == 'already_present'


def test_remaining_providers_are_opt_in_and_write_gated():
    for name in ('autogen', 'smolagents', 'phoenix', 'guardrails', 'deepeval', 'openai-evals'):
        spec = DEFAULT_PROVIDERS[name]
        assert spec.enabled is False
        assert spec.requires_approval_for_writes is True
