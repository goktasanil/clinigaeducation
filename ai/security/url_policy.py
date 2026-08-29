from __future__ import annotations

import os
from collections.abc import Iterable
from urllib.parse import urlparse


DEFAULT_INTERNAL_HOSTS = frozenset(
    {
        "localhost",
        "127.0.0.1",
        "::1",
        "vllm",
        "litellm",
        "ollama",
        "stagehand",
        "n8n",
        "research-api",
        "clinical-api",
        "biomed-api",
        "trendyol-bridge",
        "meilisearch",
        "qdrant",
        "redis",
        "postgres",
        "minio",
    }
)


def allowed_hosts_from_env(env_name: str, defaults: Iterable[str] = ()) -> set[str]:
    hosts = {str(host).strip().lower() for host in defaults if str(host).strip()}
    hosts.update(
        host.strip().lower()
        for host in os.getenv(env_name, "").split(",")
        if host.strip()
    )
    return hosts


def validate_outbound_url(
    url: str,
    *,
    allowed_hosts: Iterable[str],
    allow_query: bool = False,
    allow_fragment: bool = False,
) -> str:
    """Validate an administrator-configured outbound service URL.

    The policy prevents credentials from being sent to an arbitrary host through
    SSRF-like configuration mistakes. Plain HTTP is allowed only for known
    internal/local service names; externally routed hosts must use HTTPS.
    """
    candidate = str(url or "").strip().rstrip("/")
    parsed = urlparse(candidate)
    host = (parsed.hostname or "").lower()
    allowed = {str(item).strip().lower() for item in allowed_hosts if str(item).strip()}

    if parsed.scheme not in {"http", "https"} or not host:
        raise RuntimeError("Outbound service URL must use http(s) and include a hostname")
    if parsed.username or parsed.password:
        raise RuntimeError("Outbound service URLs may not embed credentials")
    if parsed.query and not allow_query:
        raise RuntimeError("Outbound service URLs may not contain query parameters")
    if parsed.fragment and not allow_fragment:
        raise RuntimeError("Outbound service URLs may not contain fragments")
    if host not in allowed:
        raise RuntimeError(f"Outbound service host is not allowed: {host}")
    if parsed.scheme == "http" and host not in DEFAULT_INTERNAL_HOSTS:
        raise RuntimeError("Externally routed service URLs must use HTTPS")
    return candidate
