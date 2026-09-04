from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Iterable


class IntegrationUnavailable(RuntimeError):
    pass


@dataclass(frozen=True)
class OptimizationReport:
    train_examples: int
    evaluation_examples: int
    optimizer: str


class HaystackPipelineAdapter:
    """Narrow adapter around a pre-built Haystack pipeline.

    Pipeline construction remains explicit so this layer cannot silently add a
    networked generator, document store or telemetry integration.
    """

    def __init__(self, pipeline: Any) -> None:
        if not callable(getattr(pipeline, "run", None)):
            raise TypeError("Haystack pipeline must expose run(data=...)")
        self.pipeline = pipeline

    def run(self, data: dict[str, Any], include_outputs_from: set[str] | None = None) -> dict[str, Any]:
        if not data:
            raise ValueError("Haystack pipeline input cannot be empty")
        result = self.pipeline.run(data=data, include_outputs_from=include_outputs_from)
        if not isinstance(result, dict):
            raise TypeError("Haystack pipeline must return a dictionary")
        return result


class DSPyPromptOptimizer:
    """Offline-only DSPy MIPROv2 optimizer with held-out-data enforcement."""

    def __init__(
        self,
        metric: Callable[..., float | bool],
        *,
        auto: str = "light",
        optimizer_factory: Callable[..., Any] | None = None,
    ) -> None:
        if auto not in {"light", "medium", "heavy"}:
            raise ValueError("auto must be light, medium or heavy")
        self.metric = metric
        self.auto = auto
        self.optimizer_factory = optimizer_factory

    @staticmethod
    def _example_ids(rows: Iterable[Any]) -> set[str]:
        ids: set[str] = set()
        for index, row in enumerate(rows):
            if isinstance(row, dict):
                value = row.get("id")
            else:
                value = getattr(row, "id", None)
            if value is None:
                raise ValueError(f"example {index} has no stable id")
            ids.add(str(value))
        return ids

    def compile(self, program: Any, *, trainset: list[Any], evalset: list[Any]) -> tuple[Any, OptimizationReport]:
        if len(trainset) < 8 or len(evalset) < 4:
            raise ValueError("prompt optimization requires at least 8 train and 4 evaluation examples")
        overlap = self._example_ids(trainset) & self._example_ids(evalset)
        if overlap:
            raise ValueError(f"train/evaluation overlap detected for {len(overlap)} example(s)")

        factory = self.optimizer_factory
        if factory is None:
            try:
                from dspy.teleprompt import MIPROv2
            except ImportError as exc:
                raise IntegrationUnavailable("Install ai/requirements-integrations.txt for DSPy") from exc
            factory = MIPROv2
        optimizer = factory(metric=self.metric, auto=self.auto)
        optimized = optimizer.compile(program, trainset=trainset)
        return optimized, OptimizationReport(len(trainset), len(evalset), "DSPy MIPROv2")

