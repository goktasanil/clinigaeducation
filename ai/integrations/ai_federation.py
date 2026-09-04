from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Literal

import httpx

PeerMode = Literal["openai_compatible", "ollama", "webhook"]


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

    Read/response exchange is the default. Peers cannot trigger external actions
    unless the peer is explicitly marked allow_actions=true by configuration.
    Secrets are referenced by environment-variable name and are never stored in
    the peer configuration returned to callers.
    """

    def __init__(self) -> None:
        self.peers = self._load_peers()

    @staticmethod
    def _load_peers() -> dict[str, AIPeer]:
        import json

        raw = os.getenv("CLINIGA_AI_PEERS_JSON", "[]")
        try:
            rows = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError("CLINIGA_AI_PEERS_JSON must be valid JSON") from exc
        peers: dict[str, AIPeer] = {}
        for row in rows:
            peer = AIPeer(
                name=str(row["name"]),
                mode=str(row.get("mode", "openai_compatible")),
                endpoint=str(row["endpoint"]).rstrip("/"),
                model=row.get("model"),
                api_key_env=row.get("api_key_env"),
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

    async def ask(self, peer_name: str, prompt: str, *, system: str = "You are an AI peer in a federated reasoning system.", timeout: float = 60.0) -> dict:
        peer = self.peers.get(peer_name)
        if peer is None:
            raise KeyError(f"Unknown AI peer: {peer_name}")
        async with httpx.AsyncClient(timeout=timeout) as client:
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
                return {"peer": peer.name, "answer": str(message.get("content") or ""), "raw_model": data.get("model")}
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
                return {"peer": peer.name, "answer": str((data.get("message") or {}).get("content") or ""), "raw_model": data.get("model")}
            response = await client.post(peer.endpoint, headers=self._headers(peer), json={"prompt": prompt, "system": system})
            response.raise_for_status()
            try:
                data = response.json()
            except Exception:
                data = {"answer": response.text[:12000]}
            return {"peer": peer.name, "answer": str(data.get("answer") or data.get("text") or data), "raw_model": data.get("model")}

    async def consult_many(self, peer_names: list[str], prompt: str) -> list[dict]:
        import asyncio

        names = [name for name in peer_names if name in self.peers][:8]
        return await asyncio.gather(*(self.ask(name, prompt) for name in names))

    async def action(self, peer_name: str, instruction: str) -> dict:
        peer = self.peers.get(peer_name)
        if peer is None:
            raise KeyError(f"Unknown AI peer: {peer_name}")
        if not peer.allow_actions:
            raise PermissionError("AI peer actions are disabled; consultation-only mode is active")
        return await self.ask(peer_name, instruction, system="Execute only the explicitly authorized action within your configured scope and report the result.")
