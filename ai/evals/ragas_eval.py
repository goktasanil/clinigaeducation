from __future__ import annotations

from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall


def run_rag_eval(rows: list[dict]):
    """Rows should contain question, answer, contexts and ground_truth."""
    dataset = Dataset.from_list(rows)
    return evaluate(
        dataset,
        metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
    )
