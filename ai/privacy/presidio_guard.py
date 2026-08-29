from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class RedactionResult:
    text: str
    entities: tuple[str, ...]
    redaction_count: int


def redact_sensitive_text(
    text: str,
    *,
    language: str = "en",
    entities: Iterable[str] | None = None,
) -> RedactionResult:
    """Redact PII/PHI-like identifiers before prompts, logs, or exports.

    Presidio is an optional deployment profile. This adapter deliberately does
    not return detected raw values and therefore cannot be used as a secret/PII
    extraction primitive.
    """
    if not text:
        return RedactionResult(text="", entities=(), redaction_count=0)

    try:
        from presidio_analyzer import AnalyzerEngine
        from presidio_anonymizer import AnonymizerEngine
    except ImportError as exc:  # pragma: no cover - optional profile
        raise RuntimeError(
            "Presidio profile is not installed; install ai/requirements-privacy.txt"
        ) from exc

    analyzer = AnalyzerEngine()
    selected = list(entities) if entities is not None else None
    findings = analyzer.analyze(text=text, language=language, entities=selected)
    anonymized = AnonymizerEngine().anonymize(text=text, analyzer_results=findings)
    labels = tuple(sorted({finding.entity_type for finding in findings}))
    return RedactionResult(
        text=anonymized.text,
        entities=labels,
        redaction_count=len(findings),
    )
