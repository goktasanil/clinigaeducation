from __future__ import annotations

import os
import subprocess
from collections.abc import Iterable
from pathlib import Path
from typing import Any


def extract_markdown(source: str | Path) -> str:
    from docling.document_converter import DocumentConverter

    result = DocumentConverter().convert(str(source))
    return result.document.export_to_markdown()


async def answer_with_citations(
    document_paths: Iterable[str | Path], question: str, *, model: str | None = None
) -> str:
    if not question.strip():
        raise ValueError("Question cannot be empty")

    _configure_paperqa_runtime()
    from paperqa import Docs

    docs = Docs()
    for path in document_paths:
        await docs.aadd(str(path))
    settings = paperqa_settings(model)
    session = await docs.aquery(question, settings=settings)
    return str(session)


def paperqa_settings(model: str | None = None) -> Any:
    _configure_paperqa_runtime()
    from paperqa import Settings

    settings = Settings()
    if model:
        settings.llm = model
        settings.summary_llm = model
        settings.agent.agent_llm = model
    return settings


def paperqa_ready() -> bool:
    try:
        paperqa_settings()
    except Exception:
        return False
    return True


def _configure_paperqa_runtime() -> None:
    service_root = Path(__file__).resolve().parents[2]
    os.environ.setdefault("PQA_HOME", str(service_root / "storage" / "paperqa"))
    os.environ.setdefault("LITELLM_LOCAL_MODEL_COST_MAP", "True")


def storm_ready() -> bool:
    from .health import _storm_python

    python = _storm_python()
    if python is None:
        return False
    result = subprocess.run(  # noqa: S603 - executable is the checked sibling service venv
        [str(python), "-c", "from cliniga_storm.runtime import import_runner; import_runner()"],
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    return result.returncode == 0
