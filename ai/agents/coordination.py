from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal
import uuid

TaskStatus = Literal["queued", "running", "done", "blocked"]


@dataclass
class AgentTask:
    title: str
    objective: str
    parent_objective: str
    created_by: str
    assigned_to: str | None = None
    status: TaskStatus = "queued"
    id: str = field(default_factory=lambda: str(uuid.uuid4()))


class CoordinationBoard:
    """Shared in-process task board for cooperative agents.

    Delegated work must remain relevant to the parent objective. The board is
    intentionally not a covert communication channel and does not bypass
    sandbox/network/tool policy.
    """

    def __init__(self) -> None:
        self.tasks: dict[str, AgentTask] = {}

    @staticmethod
    def _in_scope(objective: str, parent_objective: str) -> bool:
        child = set(objective.lower().split())
        parent = set(parent_objective.lower().split())
        if not child or not parent:
            return False
        return bool(child & parent)

    def delegate(self, task: AgentTask) -> AgentTask:
        if not self._in_scope(task.objective, task.parent_objective):
            raise PermissionError("Delegated task is outside the parent objective")
        self.tasks[task.id] = task
        return task

    def claim(self, task_id: str, agent_id: str) -> AgentTask:
        task = self.tasks[task_id]
        if task.status != "queued":
            raise RuntimeError("Task is not claimable")
        task.assigned_to = agent_id
        task.status = "running"
        return task

    def complete(self, task_id: str) -> AgentTask:
        task = self.tasks[task_id]
        task.status = "done"
        return task

    def list_open(self) -> list[AgentTask]:
        return [t for t in self.tasks.values() if t.status in {"queued", "running", "blocked"}]


board = CoordinationBoard()
