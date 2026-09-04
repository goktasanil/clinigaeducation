from __future__ import annotations

import os


RAGAS_QUARANTINE_REASON = (
    "Ragas is retained as an optional evaluation adapter but is disabled by default because "
    "ragas 0.4.3 is affected by PYSEC-2026-3046 and its diskcache dependency by PYSEC-2026-2447; "
    "pip-audit reported no fixed versions on 2026-08-27."
)


def run_rag_eval(rows: list[dict]):
    """Run the legacy Ragas evaluation adapter only after an explicit security override.

    Rows should contain question, answer, contexts and ground_truth. Production
    environments should leave CLINIGA_ALLOW_QUARANTINED_RAGAS unset/false until
    upstream publishes fixed dependency versions and the security audit is green.
    """
    if os.getenv("CLINIGA_ALLOW_QUARANTINED_RAGAS", "false").lower() != "true":
        raise RuntimeError(RAGAS_QUARANTINE_REASON)

    try:
        from datasets import Dataset
        from ragas import evaluate
        from ragas.metrics import answer_relevancy, context_precision, context_recall, faithfulness
    except ImportError as exc:
        raise RuntimeError("Ragas optional dependencies are not installed") from exc

    dataset = Dataset.from_list(rows)
    return evaluate(
        dataset,
        metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
    )
