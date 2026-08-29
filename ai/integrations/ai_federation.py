from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from typing import Literal

import httpx

from ai.security.url_policy import allowed_hosts_from_env, validate_outbound_url

PeerMode = Literal["openai_compatible", "ollama", "webhook"]
_VALID_MODES = {"openai_compatible", "ollama", "webhook"}
_PEER_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$")
_SECRET_ENV_RE = re.compile(r"^CLINIGA_AI_PEER_[A-Z0-9_]{1,96}$")


@dataclass(frozen=True)
class AIPeer:
    name: str
    mode: PeerMode
    endpoint: str
    model: str | None = None
    api_key_env: str | None = None
    allow_actions: bool = False


class AIFederation:
    """Communicate with explicitly configured AI peers.

    Consultation is the default. Peer endpoints are restricted by an explicit
    outbound host allowlist and peer credentials may only be referenced through
    CLINIGA_AI_PEER_* environment variables. This prevents a peer definition
    from becoming a generic SSRF or arbitrary-secret exfiltration primitive.
    """

    def __init__(self) -> None:
        self.allowed_hosts = allowed_hosts_from_env(
            "CLINIGA_AI_PEER_ALLOWED_HOSTS",
            {"localhost", "127.0.0.1", "::1", "ollama", "litellm", "vllm"},
        )
        self.peers = self._load_peers()

    def _load_peers(self) -> dict[str, AIPeer]:
        raw = os.getenv("CLINIGA_AI_PEERS_JSON", "[]")
        try:
            rows = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError("CLINIGA_AI_PEERS_JSON must be valid JSON") from exc
        if not isinstance(rows, list):
            raise RuntimeError("CLINIGA_AI_PEERS_JSON must contain a JSON array")
        if len(rows) > 32:
            raise RuntimeError("At most 32 AI peers may be configured")

        peers: dict[str, AIPeer] = {}
        for row in rows:
            if not isinstance(row, dict):
                raise RuntimeError("Each AI peer configuration must be an object")
            name = str(row.get("name") or "").strip()
            if not _PEER_NAME_RE.fullmatch(name):
                raise RuntimeError(f"Invalid AI peer name: {name!r}")
            if name in peers:
                raise RuntimeError(f"Duplicate AI peer name: {name}")

            mode = str(row.get("mode", "openai_compatible"))
            if mode not in _VALID_MODES:
                raise RuntimeError(f"Unsupported AI peer mode: {mode}")

            endpoint = validate_outbound_url(
                str(row.get("endpoint") or ""),
                allowed_hosts=self.allowed_hosts,
            )
            api_key_env = row.get("api_key_env")
            if api_key_env is not None:
                api_key_env = str(api_key_env).strip()
                if not _SECRET_ENV_RE.fullmatch(api_key_env):
                    raise RuntimeError(
                        "AI peer api_key_env must use the CLINIGA_AI_PEER_* namespace"
                    )

            model = row.get("model")
            if model is not None:
                model = str(model)[:200]

            peer = AIPeer(
                name=name,
                mode=mode,
                endpoint=endpoint,
                model=model,
                api_key_env=api_key_env,
                allow_actions=bool(row.get("allow_actions", False)),
            )
            peers[peer.name] = peer
        return peers

    def list_peers(self) -> list[dict]:
        return [
            {
                "name": p.name,
                "mode": p.mode,
                "model": p.model,
                "allow_actions": p.allow_actions,
            }
            for p in self.peers.values()
        ]

    def _headers(self, peer: AIPeer) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if peer.api_key_env:
            value = os.getenv(peer.api_key_env, "")
            if value:
                headers["Authorization"] = f"Bearer {value}"
        return headers

    async def ask(
        self,
        peer_name: str,
        prompt: str,
        *,
        system: str = "You are an AI peer in a federated reasoning system.",
        timeout: float = 60.0,
    ) -> dict:
        peer = self.peers.get(peer_name)
        if peer is None:
            raise KeyError(f"Unknown AI peer: {peer_name}")
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
            if peer.mode == "openai_compatible":
                response = await client.post(
                    f"{peer.endpoint}/chat/completions",
                    headers=self._headers(peer),
                    json={
                        "model": peer.model or "default",
                        "messages": [
                            {"role": "system", "content": system},
                            {"role": "user", "content": prompt},
                        ],
                    },
                )
                response.raise_for_status()
                data = response.json()
                choice = (data.get("choices") or [{}])[0]
                message = choice.get("message") or {}
                return {
                    "peer": peer.name,
                    "answer": str(message.get("content") or ""),
                    "raw_model": data.get("model"),
                }
            if peer.mode == "ollama":
                response = await client.post(
                    f"{peer.endpoint}/api/chat",
                    json={
                        "model": peer.model or "llama3.1",
                        "messages": [
                            {"role": "system", "content": system},
                            {"role": "user", "content": prompt},
                        ],
                        "stream": False,
                    },
                )
                response.raise_for_status()
                data = response.json()
                return {
                    "peer": peer.name,
                    "answer": str((data.get("message") or {}).get("content") or ""),
                    "raw_model": data.get("model"),
                }

            response = await client.post(
                peer.endpoint,
                headers=self._headers(peer),
                json={"prompt": prompt, "system": system},
            )
            response.raise_for_status()
            try:
                data = response.json()
            except ValueError:
                data = {"answer": response.text[:12000]}
            return {
                "peer": peer.name,
                "answer": str(data.get("answer") or data.get("text") or data),
                "raw_model": data.get("model"),
            }

    async def consult_many(self, peer_names: list[str], prompt: str) -> list[dict]:
        import asyncio

        names = list(dict.fromkeys(name for name in peer_names if name in self.peers))[:8]
        return await asyncio.gather(*(self.ask(name, prompt) for name in names))

    async def action(self, peer_name: str, instruction: str) -> dict:
        peer = self.peers.get(peer_name)
        if peer is None:
            raise KeyError(f"Unknown AI peer: {peer_name}")
        if not peer.allow_actions:
            raise PermissionError("AI peer actions are disabled; consultation-only mode is active")
        return await self.ask(
            peer_name,
            instruction,
            system="Execute only the explicitly authorized action within your configured scope and report the result.",
        )
