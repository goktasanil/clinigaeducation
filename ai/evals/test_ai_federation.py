import pytest

from ai.integrations.ai_federation import AIFederation


def test_peers_default_to_consultation_only(monkeypatch):
    monkeypatch.setenv(
        "CLINIGA_AI_PEERS_JSON",
        '[{"name":"peer-a","mode":"openai_compatible","endpoint":"http://localhost:9999/v1","model":"test-model"}]',
    )
    federation = AIFederation()
    peers = federation.list_peers()
    assert peers == [{"name":"peer-a","mode":"openai_compatible","model":"test-model","allow_actions":False}]


@pytest.mark.asyncio
async def test_action_requires_explicit_enable(monkeypatch):
    monkeypatch.setenv(
        "CLINIGA_AI_PEERS_JSON",
        '[{"name":"peer-a","mode":"webhook","endpoint":"http://localhost:9999/peer"}]',
    )
    federation = AIFederation()
    with pytest.raises(PermissionError):
        await federation.action("peer-a", "do something")


def test_peer_secret_value_is_not_exposed(monkeypatch):
    monkeypatch.setenv("CLINIGA_AI_PEER_TEST_KEY", "super-secret-value")
    monkeypatch.setenv(
        "CLINIGA_AI_PEERS_JSON",
        '[{"name":"peer-a","mode":"openai_compatible","endpoint":"http://localhost:9999/v1","api_key_env":"CLINIGA_AI_PEER_TEST_KEY"}]',
    )
    federation = AIFederation()
    assert "super-secret-value" not in str(federation.list_peers())


def test_peer_rejects_arbitrary_secret_environment_reference(monkeypatch):
    monkeypatch.setenv("UNRELATED_SECRET", "should-never-be-readable-by-peer-config")
    monkeypatch.setenv(
        "CLINIGA_AI_PEERS_JSON",
        '[{"name":"peer-a","mode":"openai_compatible","endpoint":"http://localhost:9999/v1","api_key_env":"UNRELATED_SECRET"}]',
    )
    with pytest.raises(RuntimeError, match="CLINIGA_AI_PEER"):
        AIFederation()


def test_peer_rejects_unapproved_endpoint_host(monkeypatch):
    monkeypatch.setenv(
        "CLINIGA_AI_PEERS_JSON",
        '[{"name":"peer-a","mode":"openai_compatible","endpoint":"https://evil.example/v1"}]',
    )
    monkeypatch.delenv("CLINIGA_AI_PEER_ALLOWED_HOSTS", raising=False)
    with pytest.raises(RuntimeError, match="not allowed"):
        AIFederation()


def test_external_peer_requires_https_even_when_allowlisted(monkeypatch):
    monkeypatch.setenv("CLINIGA_AI_PEER_ALLOWED_HOSTS", "peer.example")
    monkeypatch.setenv(
        "CLINIGA_AI_PEERS_JSON",
        '[{"name":"peer-a","mode":"openai_compatible","endpoint":"http://peer.example/v1"}]',
    )
    with pytest.raises(RuntimeError, match="HTTPS"):
        AIFederation()


def test_duplicate_peer_names_are_rejected(monkeypatch):
    monkeypatch.setenv(
        "CLINIGA_AI_PEERS_JSON",
        '[{"name":"peer-a","endpoint":"http://localhost:9999/v1"},{"name":"peer-a","endpoint":"http://localhost:9998/v1"}]',
    )
    with pytest.raises(RuntimeError, match="Duplicate"):
        AIFederation()
