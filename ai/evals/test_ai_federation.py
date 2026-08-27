import os

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
    monkeypatch.setenv("PEER_SECRET", "super-secret-value")
    monkeypatch.setenv(
        "CLINIGA_AI_PEERS_JSON",
        '[{"name":"peer-a","mode":"openai_compatible","endpoint":"http://localhost:9999/v1","api_key_env":"PEER_SECRET"}]',
    )
    federation = AIFederation()
    assert "super-secret-value" not in str(federation.list_peers())
