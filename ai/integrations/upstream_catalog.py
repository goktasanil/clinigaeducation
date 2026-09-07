from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UpstreamCapability:
    repo: str
    role: str
    integration_mode: str
    notes: str


UPSTREAM_CAPABILITIES = [
    UpstreamCapability(
        repo="microsoft/autogen",
        role="multi_agent_orchestration",
        integration_mode="optional_adapter",
        notes="Alternative event-driven multi-agent runtime; keep behind existing CliniGA permission boundaries.",
    ),
    UpstreamCapability(
        repo="huggingface/smolagents",
        role="lightweight_tool_agents",
        integration_mode="optional_adapter",
        notes="Compact tool-using agent path for low-overhead tasks and benchmark comparisons.",
    ),
    UpstreamCapability(
        repo="openai/evals",
        role="evaluation_harness",
        integration_mode="reference_and_adapter",
        notes="Use eval patterns and schemas to broaden regression coverage; do not copy benchmark claims without running them.",
    ),
    UpstreamCapability(
        repo="Arize-ai/phoenix",
        role="llm_observability_and_tracing",
        integration_mode="optional_otel_backend",
        notes="Tracing/evaluation backend compatible with OpenTelemetry-style instrumentation.",
    ),
    UpstreamCapability(
        repo="guardrails-ai/guardrails",
        role="structured_output_validation",
        integration_mode="optional_validator",
        notes="Schema and response validation layer for selected high-risk structured outputs.",
    ),
    UpstreamCapability(
        repo="confident-ai/deepeval",
        role="llm_quality_evaluation",
        integration_mode="optional_eval_provider",
        notes="Additional quality and regression metrics alongside existing Ragas/Promptfoo evaluation.",
    ),
    UpstreamCapability(
        repo="vibrantlabsai/ragas",
        role="rag_evaluation",
        integration_mode="already_present",
        notes="Ragas is already part of the AI stack; catalog entry prevents duplicate installation.",
    ),
]


def list_upstreams() -> list[dict]:
    return [item.__dict__ for item in UPSTREAM_CAPABILITIES]
