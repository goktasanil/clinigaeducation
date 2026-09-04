from __future__ import annotations

from dataclasses import dataclass
import importlib.util
import json
from pathlib import Path
import shutil
from typing import Callable

from .router import ToolRouter


@dataclass(frozen=True)
class ResearchIntegration:
    repository: str
    commit: str
    profile: str
    ecosystem: str
    probe_kind: str
    probe: str
    deployment: str

    def __post_init__(self) -> None:
        if self.ecosystem not in {"python", "jvm", "r"}:
            raise ValueError(f"unsupported ecosystem for {self.repository}")
        if self.probe_kind not in {"python_module", "command", "manual"}:
            raise ValueError(f"unsupported probe for {self.repository}")


@dataclass(frozen=True)
class ResearchActivation:
    repository: str
    operator: str
    data_class: str
    human_approved: bool = False
    dataset_rights_confirmed: bool = False
    deidentified: bool = False
    external_network: bool = False


@dataclass(frozen=True)
class ResearchIntegrationStatus:
    repository: str
    available: bool
    activation: str
    detail: str


class ResearchIntegrationRegistry:
    def __init__(self, integrations: tuple[ResearchIntegration, ...]) -> None:
        names = [row.repository for row in integrations]
        if len(names) != len(set(names)):
            raise ValueError("duplicate research integration")
        self._integrations = integrations

    @classmethod
    def from_json(
        cls,
        path: str | Path,
        router: ToolRouter,
    ) -> "ResearchIntegrationRegistry":
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        if data.get("schema_version") != 1 or data.get("default_activation") != "disabled":
            raise ValueError("research integrations must use schema 1 and default-off activation")
        integrations = tuple(ResearchIntegration(**row) for row in data["profiles"])
        tools = {row.repository: row for row in router.all()}
        enabled = {row.repository for row in router.all() if row.mode == "optional_isolated"}
        mapped = {row.repository for row in integrations}
        if mapped != enabled:
            raise ValueError(
                f"research integration coverage mismatch: "
                f"missing={sorted(enabled - mapped)}, unexpected={sorted(mapped - enabled)}"
            )
        for integration in integrations:
            if integration.commit != tools[integration.repository].commit:
                raise ValueError(f"commit mismatch for {integration.repository}")
        return cls(integrations)

    def all(self) -> tuple[ResearchIntegration, ...]:
        return self._integrations

    def status(
        self,
        *,
        module_probe: Callable[[str], bool] | None = None,
        command_probe: Callable[[str], bool] | None = None,
    ) -> tuple[ResearchIntegrationStatus, ...]:
        module_probe = module_probe or (lambda name: importlib.util.find_spec(name) is not None)
        command_probe = command_probe or (lambda name: shutil.which(name) is not None)
        statuses: list[ResearchIntegrationStatus] = []
        for row in self._integrations:
            if row.probe_kind == "python_module":
                available = module_probe(row.probe)
                detail = f"python module: {row.probe}"
            elif row.probe_kind == "command":
                available = command_probe(row.probe)
                detail = f"command: {row.probe}"
            else:
                available = False
                detail = f"manual isolated runtime check required: {row.probe}"
            statuses.append(
                ResearchIntegrationStatus(row.repository, available, "disabled", detail)
            )
        return tuple(statuses)

    def authorize(self, request: ResearchActivation) -> ResearchIntegration:
        integrations = {row.repository: row for row in self._integrations}
        integration = integrations.get(request.repository)
        if integration is None:
            raise PermissionError("repository is blocked or reference-only")
        if request.data_class not in {"public", "internal", "confidential", "restricted"}:
            raise ValueError("unsupported data classification")
        if not request.operator.strip() or not request.human_approved:
            raise PermissionError("named human approval is required")
        if not request.dataset_rights_confirmed:
            raise PermissionError("dataset and full-text usage rights must be confirmed")
        if request.data_class != "public" and not request.deidentified:
            raise PermissionError("non-public research data must be de-identified")
        if request.data_class == "restricted" and request.external_network:
            raise PermissionError("restricted research data cannot use an external network")
        return integration
