from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

_REVISION = re.compile(r"^[0-9a-f]{40}$")
_ALLOWED_TASKS = {
    "arc_challenge",
    "belebele",
    "bbh",
    "gsm8k",
    "hellaswag",
    "mmlu_pro",
    "truthfulqa_mc2",
    "winogrande",
}


@dataclass(frozen=True)
class LMEvalPlan:
    argv: tuple[str, ...]
    environment: tuple[tuple[str, str], ...]
    network_mode: str
    package_version: str = "0.4.12"
    reviewed_commit: str = "0f8479cc83a1b9652294d1c0257d22c7756155ec"


class IsolatedLMEvalGateway:
    """Build argv for a separately approved evaluator; never starts a process."""

    def __init__(self, model_root: str | Path, output_root: str | Path) -> None:
        self.model_root = Path(model_root).resolve()
        self.output_root = Path(output_root).resolve()

    @staticmethod
    def _inside(path: str | Path, root: Path) -> Path:
        candidate = (root / path).resolve() if not Path(path).is_absolute() else Path(path).resolve()
        if not candidate.is_relative_to(root):
            raise PermissionError("path escapes the approved evaluation root")
        return candidate

    def build_plan(
        self,
        *,
        model_path: str | Path,
        model_revision: str,
        output_path: str | Path,
        tasks: Sequence[str],
        isolated: bool,
        known_risk_approved: bool,
        device: str = "cuda:0",
    ) -> LMEvalPlan:
        if not isolated or not known_risk_approved:
            raise PermissionError("lm-eval requires isolated execution and explicit risk approval")
        if not _REVISION.fullmatch(model_revision):
            raise ValueError("model_revision must be an immutable 40-character commit SHA")
        task_list = tuple(dict.fromkeys(tasks))
        if not task_list or any(task not in _ALLOWED_TASKS for task in task_list):
            raise PermissionError("benchmark task is not allowlisted")
        model = self._inside(model_path, self.model_root)
        if not model.is_dir():
            raise FileNotFoundError(model)
        output = self._inside(output_path, self.output_root)
        model_args = f"pretrained={model},revision={model_revision},trust_remote_code=False"
        argv = (
            "lm-eval",
            "run",
            "--model",
            "hf",
            "--model_args",
            model_args,
            "--tasks",
            ",".join(task_list),
            "--device",
            device,
            "--batch_size",
            "auto",
            "--output_path",
            str(output),
            "--check_integrity",
        )
        return LMEvalPlan(
            argv=argv,
            environment=(
                ("HF_DATASETS_OFFLINE", "1"),
                ("HF_HUB_OFFLINE", "1"),
                ("TRANSFORMERS_OFFLINE", "1"),
            ),
            network_mode="none",
        )
