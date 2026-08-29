from __future__ import annotations

import os
from dataclasses import dataclass
from urllib.parse import urlparse

import httpx

from ai.integrations.domain_profiles import select_domain_profiles


@dataclass(frozen=True)
class ExpertDelegation:
    profile: str
    endpoint: str
    response: dict


class ExpertDelegator:
    """Delegate domain tasks from the core runtime to isolated expert services.

    Delegation is disabled unless an admin configures both the expert endpoint and
    the shared internal service token. Specialist runtimes never re-delegate,
    preventing loops.
    """

    PROFILE_ENV = {
        "research": "CLINIGA_RESEARCH_API_URL",
        "clinical": "CLINIGA_CLINICAL_API_URL",
        "privacy": "CLINIGA_CLINICAL_API_URL",
        "biomed": "CLINIGA_BIOMED_API_URL",
    }

    def __init__(self) -> None:
        self.runtime_profile = os.getenv("CLINIGA_RUNTIME_PROFILE", "core").strip().lower() or "core"
        self.token = os.getenv("CLINIGA_INTERNAL_SERVICE_TOKEN", "").strip()
        self.timeout = float(os.getenv("CLINIGA_EXPERT_TIMEOUT_SECONDS", "90"))

    @staticmethod
    def _validate_endpoint(endpoint: str) -> str:
        parsed = urlparse(endpoint)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            raise RuntimeError("Expert endpoint must be an admin-configured http(s) URL")
        return endpoint.rstrip("/")

    def _target(self, task: str) -> tuple[str, str] | None:
        if self.runtime_profile != "core" or not self.token:
            return None
        for profile in select_domain_profiles(task):
            env_name = self.PROFILE_ENV.get(profile.name)
            if not env_name:
                continue
            endpoint = os.getenv(env_name, "").strip()
            if endpoint:
                return profile.name, self._validate_endpoint(endpoint)
        return None

    async def delegate(
        self,
        *,
        tenant_id: str,
        user_id: str,
        task: str,
        context: list[dict] | None = None,
        test_log: str | None = None,
    ) -> ExpertDelegation | None:
        target = self._target(task)
        if target is None:
            return None
        profile, endpoint = target
        payload = {
            "tenant_id": tenant_id,
            "user_id": user_id,
            "task": task,
            "context": context or [],
            "test_log": test_log,
        }
        headers = {"X-Internal-Service-Token": self.token}
        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=False) as client:
            response = await client.post(f"{endpoint}/internal/agent", json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
        if not isinstance(data, dict):
            raise RuntimeError("Expert runtime returned an invalid response")
        return ExpertDelegation(profile=profile, endpoint=endpoint, response=data)
