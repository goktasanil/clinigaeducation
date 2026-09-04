from __future__ import annotations

import inspect
import json
import os
import re
from dataclasses import dataclass
from typing import Any, Awaitable, Callable

from pydantic import BaseModel, Field

_IDENTIFIER = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{0,199}$")
_ALLOWED_WORKFLOWS = {"cliniga-agent", "cliniga-ingest", "cliniga-evaluation"}


class DurableTask(BaseModel):
    tenant_id: str = Field(min_length=1, max_length=200)
    subject: str = Field(min_length=1, max_length=200)
    task_id: str = Field(min_length=1, max_length=200)
    payload: dict[str, Any] = Field(default_factory=dict)


@dataclass(frozen=True)
class WorkflowHandle:
    workflow_id: str
    run_id: str | None
    workflow: str


async def _default_client_factory(address: str, namespace: str):
    try:
        from temporalio.client import Client
    except ImportError as exc:
        raise RuntimeError("Install ai/requirements-integrations.txt for Temporal") from exc
    return await Client.connect(address, namespace=namespace)


class TemporalGateway:
    """Allowlisted, tenant-scoped Temporal workflow starter."""

    def __init__(
        self,
        *,
        address: str | None = None,
        namespace: str | None = None,
        task_queue: str | None = None,
        client_factory: Callable[[str, str], Awaitable[Any] | Any] | None = None,
    ) -> None:
        self.address = (address or os.getenv("CLINIGA_TEMPORAL_ADDRESS", "")).strip()
        self.namespace = (namespace or os.getenv("CLINIGA_TEMPORAL_NAMESPACE", "default")).strip()
        self.task_queue = (task_queue or os.getenv("CLINIGA_TEMPORAL_TASK_QUEUE", "cliniga-ai")).strip()
        self.client_factory = client_factory or _default_client_factory

    @property
    def enabled(self) -> bool:
        return bool(self.address)

    async def start(self, workflow: str, task: DurableTask) -> WorkflowHandle:
        if not self.enabled:
            raise RuntimeError("Temporal is not configured")
        if workflow not in _ALLOWED_WORKFLOWS:
            raise PermissionError("workflow is not allowlisted")
        for label, value in {"tenant_id": task.tenant_id, "task_id": task.task_id}.items():
            if not _IDENTIFIER.fullmatch(value):
                raise ValueError(f"invalid {label}")
        serialized = json.dumps(task.model_dump(), separators=(",", ":"), default=str)
        if len(serialized.encode("utf-8")) > 64 * 1024:
            raise ValueError("workflow payload exceeds 64 KiB; store large inputs in the authorized object store")

        client = self.client_factory(self.address, self.namespace)
        if inspect.isawaitable(client):
            client = await client
        workflow_id = f"{task.tenant_id}:{workflow}:{task.task_id}"
        handle = await client.start_workflow(
            workflow,
            task.model_dump(),
            id=workflow_id,
            task_queue=self.task_queue,
        )
        return WorkflowHandle(workflow_id, getattr(handle, "first_execution_run_id", None), workflow)

