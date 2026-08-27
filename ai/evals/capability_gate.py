from __future__ import annotations

import hashlib
import json
import math
from dataclasses import dataclass
from typing import Mapping, Sequence


@dataclass(frozen=True)
class MetricThreshold:
    name: str
    minimum: float
    max_regression: float = 0.0


@dataclass(frozen=True)
class GateFailure:
    metric: str
    reason: str


@dataclass(frozen=True)
class GateReport:
    passed: bool
    failures: tuple[GateFailure, ...]


def _score(value: object, name: str) -> float:
    score = float(value)
    if not math.isfinite(score) or not 0.0 <= score <= 1.0:
        raise ValueError(f"metric {name!r} must be a finite score between 0 and 1")
    return score


class CapabilityGate:
    """Fail a candidate model on missing targets or unacceptable regression."""

    def __init__(self, thresholds: Sequence[MetricThreshold]) -> None:
        self.thresholds = tuple(thresholds)
        if not self.thresholds or len({item.name for item in self.thresholds}) != len(self.thresholds):
            raise ValueError("threshold names must be non-empty and unique")

    def evaluate(self, current: Mapping[str, object], baseline: Mapping[str, object] | None = None) -> GateReport:
        failures: list[GateFailure] = []
        baseline = baseline or {}
        for threshold in self.thresholds:
            if threshold.name not in current:
                failures.append(GateFailure(threshold.name, "missing metric"))
                continue
            value = _score(current[threshold.name], threshold.name)
            if value < threshold.minimum:
                failures.append(GateFailure(threshold.name, f"{value:.6f} below minimum {threshold.minimum:.6f}"))
            if threshold.name in baseline:
                reference = _score(baseline[threshold.name], threshold.name)
                if value < reference - threshold.max_regression:
                    failures.append(GateFailure(threshold.name, f"{value:.6f} regressed from {reference:.6f}"))
        return GateReport(not failures, tuple(failures))


def attest_results(model_revision: str, metrics: Mapping[str, object]) -> dict[str, object]:
    if not re_full_sha(model_revision):
        raise ValueError("model_revision must be an immutable 40-character commit SHA")
    normalized = {name: _score(value, name) for name, value in sorted(metrics.items())}
    payload = {"model_revision": model_revision, "metrics": normalized}
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return {**payload, "sha256": hashlib.sha256(canonical.encode("utf-8")).hexdigest()}


def re_full_sha(value: str) -> bool:
    return len(value) == 40 and all(char in "0123456789abcdef" for char in value)
