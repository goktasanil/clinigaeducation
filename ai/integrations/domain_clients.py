from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

import httpx

from ai.security.url_policy import allowed_hosts_from_env, validate_outbound_url


@dataclass(frozen=True)
class ServiceStatus:
    name: str
    enabled: bool
    mode: str


class ConfiguredHTTPService:
    """HTTP adapter restricted to an administrator-configured base URL.

    Relative paths only are accepted. Mutating methods require explicit approval.
    Token-bearing requests may only target hosts in CLINIGA_DOMAIN_ALLOWED_HOSTS
    (plus explicitly supplied internal defaults), preventing configuration-based
    credential exfiltration.
    """

    WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

    def __init__(
        self,
        name: str,
        url_env: str,
        token_env: str | None = None,
        *,
        default_hosts: set[str] | None = None,
    ) -> None:
        self.name = name
        raw = os.getenv(url_env, "").strip()
        self.base_url = ""
        if raw:
            hosts = allowed_hosts_from_env(
                "CLINIGA_DOMAIN_ALLOWED_HOSTS",
                default_hosts or set(),
            )
            self.base_url = validate_outbound_url(raw, allowed_hosts=hosts)
        self.token = os.getenv(token_env, "").strip() if token_env else ""

    @property
    def enabled(self) -> bool:
        return bool(self.base_url)

    async def request(
        self,
        path: str,
        *,
        method: str = "GET",
        json: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
        approved: bool = False,
        timeout: float = 30.0,
    ) -> Any:
        if not self.enabled:
            raise RuntimeError(f"{self.name} is not configured")
        if not path.startswith("/") or path.startswith("//"):
            raise ValueError("service paths must be relative and begin with a single slash")
        method = method.upper()
        if method in self.WRITE_METHODS and not approved:
            raise PermissionError(f"{self.name} write requires explicit approval")
        headers = {"Accept": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
            response = await client.request(
                method,
                f"{self.base_url}{path}",
                headers=headers,
                json=json,
                params=params,
            )
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                return response.json()
            return {"status": response.status_code, "text": response.text[:4000]}


class PostHogClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("CLINIGA_POSTHOG_API_KEY", "").strip()
        raw_host = os.getenv("CLINIGA_POSTHOG_HOST", "https://us.i.posthog.com").strip()
        hosts = allowed_hosts_from_env(
            "CLINIGA_DOMAIN_ALLOWED_HOSTS",
            {"us.i.posthog.com", "eu.i.posthog.com", "localhost", "127.0.0.1", "::1"},
        )
        self.host = validate_outbound_url(raw_host, allowed_hosts=hosts)

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    def capture(
        self,
        distinct_id: str,
        event: str,
        properties: dict[str, Any] | None = None,
        *,
        approved: bool = False,
    ) -> None:
        if not approved:
            raise PermissionError("posthog event write requires explicit approval")
        if not self.enabled:
            raise RuntimeError("posthog is not configured")
        from posthog import Posthog

        client = Posthog(self.api_key, host=self.host)
        client.capture(distinct_id=distinct_id, event=event, properties=properties or {})
        client.shutdown()


class MeilisearchClient:
    def __init__(self) -> None:
        raw = os.getenv("CLINIGA_MEILISEARCH_URL", "").strip()
        self.url = ""
        if raw:
            hosts = allowed_hosts_from_env(
                "CLINIGA_DOMAIN_ALLOWED_HOSTS",
                {"meilisearch", "localhost", "127.0.0.1", "::1"},
            )
            self.url = validate_outbound_url(raw, allowed_hosts=hosts)
        self.api_key = os.getenv("CLINIGA_MEILISEARCH_API_KEY", "").strip()

    @property
    def enabled(self) -> bool:
        return bool(self.url)

    def search(self, index: str, query: str, *, limit: int = 20) -> dict[str, Any]:
        if not self.enabled:
            raise RuntimeError("meilisearch is not configured")
        import meilisearch

        client = meilisearch.Client(self.url, self.api_key or None)
        return client.index(index).search(query, {"limit": min(max(limit, 1), 100)})


class ZoteroClient:
    def __init__(self) -> None:
        self.library_id = os.getenv("CLINIGA_ZOTERO_LIBRARY_ID", "").strip()
        self.library_type = os.getenv("CLINIGA_ZOTERO_LIBRARY_TYPE", "user").strip()
        self.api_key = os.getenv("CLINIGA_ZOTERO_API_KEY", "").strip()

    @property
    def enabled(self) -> bool:
        return bool(self.library_id and self.api_key)

    def search(self, query: str, *, limit: int = 20) -> list[dict[str, Any]]:
        if not self.enabled:
            raise RuntimeError("zotero is not configured")
        from pyzotero import zotero

        client = zotero.Zotero(self.library_id, self.library_type, self.api_key)
        return client.items(q=query, limit=min(max(limit, 1), 100))


class SerpApiClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("CLINIGA_SERPAPI_API_KEY", "").strip()

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    def search(self, query: str, *, engine: str = "google") -> dict[str, Any]:
        if not self.enabled:
            raise RuntimeError("serpapi is not configured")
        from serpapi import GoogleSearch

        params = {"engine": engine, "q": query, "api_key": self.api_key}
        return GoogleSearch(params).get_dict()


SERVICES = {
    "matomo": ConfiguredHTTPService("matomo", "CLINIGA_MATOMO_URL", "CLINIGA_MATOMO_TOKEN"),
    "plausible": ConfiguredHTTPService("plausible", "CLINIGA_PLAUSIBLE_URL", "CLINIGA_PLAUSIBLE_API_KEY"),
    "twenty-crm": ConfiguredHTTPService("twenty-crm", "CLINIGA_TWENTY_URL", "CLINIGA_TWENTY_API_KEY"),
    "calcom": ConfiguredHTTPService("calcom", "CLINIGA_CALCOM_URL", "CLINIGA_CALCOM_API_KEY"),
    "evidence": ConfiguredHTTPService("evidence", "CLINIGA_EVIDENCE_URL", "CLINIGA_EVIDENCE_API_KEY"),
    "trendyol-seller-growth": ConfiguredHTTPService(
        "trendyol-seller-growth",
        "CLINIGA_TRENDYOL_API_URL",
        "CLINIGA_TRENDYOL_API_TOKEN",
        default_hosts={"trendyol-bridge", "localhost", "127.0.0.1", "::1"},
    ),
}


def domain_service_status() -> list[ServiceStatus]:
    statuses = [
        ServiceStatus("posthog", PostHogClient().enabled, "sdk"),
        ServiceStatus("meilisearch", MeilisearchClient().enabled, "sdk"),
        ServiceStatus("zotero", ZoteroClient().enabled, "sdk"),
        ServiceStatus("serpapi", SerpApiClient().enabled, "sdk"),
    ]
    statuses.extend(ServiceStatus(name, client.enabled, "http") for name, client in SERVICES.items())
    return statuses
