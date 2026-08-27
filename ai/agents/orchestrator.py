from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, TypedDict

from langgraph.graph import END, StateGraph

AgentRole = Literal["planner", "researcher", "coder", "critic", "finalizer"]


class AgentState(TypedDict, total=False):
    task: str
    plan: list[str]
    research: list[str]
    code_notes: list[str]
    critique: list[str]
    answer: str
    route: AgentRole


@dataclass
class MultiAgentOrchestrator:
    """Deterministic skeleton for planner → specialist → critic → finalizer flows.

    Model/tool execution is injected later so orchestration remains testable and safe.
    """

    def planner(self, state: AgentState) -> AgentState:
        task = state.get("task", "")
        return {
            **state,
            "plan": [
                "Clarify objective and constraints",
                "Gather supporting evidence",
                "Produce implementation or answer",
                "Critique for correctness, safety and completeness",
            ],
            "route": "researcher" if any(k in task.lower() for k in ["research", "araştır", "latest", "güncel"]) else "coder",
        }

    def researcher(self, state: AgentState) -> AgentState:
        return {**state, "research": state.get("research", []), "route": "critic"}

    def coder(self, state: AgentState) -> AgentState:
        return {**state, "code_notes": state.get("code_notes", []), "route": "critic"}

    def critic(self, state: AgentState) -> AgentState:
        checks = [
            "claims grounded in available evidence",
            "tool permissions respected",
            "no secrets or sensitive data exposed",
            "output addresses the requested objective",
        ]
        return {**state, "critique": checks, "route": "finalizer"}

    def finalizer(self, state: AgentState) -> AgentState:
        return {**state, "answer": state.get("answer", ""), "route": "finalizer"}

    def build(self):
        graph = StateGraph(AgentState)
        graph.add_node("planner", self.planner)
        graph.add_node("researcher", self.researcher)
        graph.add_node("coder", self.coder)
        graph.add_node("critic", self.critic)
        graph.add_node("finalizer", self.finalizer)
        graph.set_entry_point("planner")
        graph.add_conditional_edges("planner", lambda s: s["route"], {"researcher": "researcher", "coder": "coder"})
        graph.add_edge("researcher", "critic")
        graph.add_edge("coder", "critic")
        graph.add_edge("critic", "finalizer")
        graph.add_edge("finalizer", END)
        return graph.compile()
