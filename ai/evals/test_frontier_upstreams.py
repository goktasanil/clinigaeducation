import re

from ai.integrations.frontier_upstreams import (
    components,
    installable_packages,
    isolated_providers,
    load_manifest,
    repositories,
)
from ai.integrations.provider_registry import DEFAULT_PROVIDERS


SHA40 = re.compile(r"^[0-9a-f]{40}$")


def test_frontier_manifest_is_pinned_deduplicated_and_default_off():
    manifest = load_manifest()
    rows = components()
    repos = repositories()

    assert manifest["policy"] == "pinned-metadata-opt-in-adapters-no-vendoring"
    assert len(repos) == len(set(repos))
    assert all(SHA40.fullmatch(row["commit"]) for row in rows)
    assert all(row["default_disabled"] is True for row in rows)
    assert all(row["constraints"] for row in rows)
    assert "alainbrown/openfable" not in repos


def test_only_reviewed_adapter_is_installable_in_the_optional_worker():
    assert installable_packages() == ["openai-agents==0.22.0"]
    statuses = {row["provider"]: row["status"] for row in components()}
    assert statuses["codex"] == "reference-only-isolated"
    assert statuses["inspect-ai"] == "approved-isolated-evaluator"
    assert statuses["promptfoo"] == "restricted-isolated-evaluator"
    assert statuses["aider"] == "reference-only-license-recheck"


def test_runtime_providers_are_registered_but_never_enabled_by_default():
    expected = {
        "openai-agents": "orchestrator",
        "codex": "coding_agent",
        "inspect-ai": "eval",
        "promptfoo": "eval",
        "mcp": "orchestrator",
        "openhands": "coding_agent",
        "swe-agent": "coding_agent",
        "aider": "coding_agent",
    }
    for name, kind in expected.items():
        spec = DEFAULT_PROVIDERS[name]
        assert spec.kind == kind
        assert spec.enabled is False
        assert spec.requires_approval_for_writes is True

    assert set(isolated_providers()) == {
        "codex",
        "inspect-ai",
        "promptfoo",
        "openhands",
        "swe-agent",
    }
