from __future__ import annotations

from typing import Any, Callable

from pydantic import BaseModel, Field


class TypedAgentOutput(BaseModel):
    answer: str = Field(min_length=1, max_length=30000)
    citations: list[str] = Field(default_factory=list, max_length=50)
    confidence: float = Field(ge=0.0, le=1.0)
    requires_human_review: bool = True


class TypedAgentRunner:
    """PydanticAI adapter with a fixed validated output contract."""

    def __init__(
        self,
        model: str,
        *,
        instructions: str,
        agent_factory: Callable[..., Any] | None = None,
    ) -> None:
        if not model.strip() or not instructions.strip():
            raise ValueError("model and instructions are required")
        if agent_factory is None:
            try:
                from pydantic_ai import Agent
            except ImportError as exc:
                raise RuntimeError("Install ai/requirements-integrations.txt for PydanticAI") from exc
            agent_factory = Agent
        self.agent = agent_factory(model, instructions=instructions, output_type=TypedAgentOutput)

    async def run(self, prompt: str, *, deps: Any = None) -> TypedAgentOutput:
        if not prompt.strip():
            raise ValueError("prompt cannot be empty")
        result = await self.agent.run(prompt, deps=deps)
        output = getattr(result, "output", result)
        return output if isinstance(output, TypedAgentOutput) else TypedAgentOutput.model_validate(output)

