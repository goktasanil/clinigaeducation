from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import platform
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .config import LabConfig, load_config
from .data import overlapping_records, to_prompt_completion, validate_jsonl


def file_sha256(path: str | Path) -> str:
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def package_versions() -> dict[str, str]:
    packages = ["torch", "transformers", "trl", "peft", "datasets", "accelerate", "bitsandbytes"]
    versions: dict[str, str] = {}
    for package in packages:
        try:
            versions[package] = importlib.metadata.version(package)
        except importlib.metadata.PackageNotFoundError:
            versions[package] = "not-installed"
    return versions


def load_and_check_data(config: LabConfig):
    from datasets import Dataset

    train_report = validate_jsonl(config.data.train_file)
    eval_report = validate_jsonl(config.data.eval_file)
    errors = [*train_report.errors, *eval_report.errors]
    warnings = [*train_report.warnings, *eval_report.warnings]
    if errors:
        raise ValueError("Dataset validation failed:\n" + "\n".join(errors))
    overlap = overlapping_records(train_report.records, eval_report.records)
    if overlap:
        raise ValueError(f"Train/evaluation leakage: {overlap} identical record(s)")
    for warning in warnings:
        print(f"WARNING: {warning}")
    train = Dataset.from_list([to_prompt_completion(item) for item in train_report.records])
    evaluation = Dataset.from_list([to_prompt_completion(item) for item in eval_report.records])
    return train, evaluation, train_report, eval_report


def build_model_and_tokenizer(config: LabConfig):
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

    if config.model.qlora_4bit and not torch.cuda.is_available():
        raise RuntimeError("QLoRA requires a supported CUDA GPU; disable qlora_4bit for a tiny CPU smoke test")

    dtype = torch.bfloat16 if torch.cuda.is_available() and torch.cuda.is_bf16_supported() else torch.float16
    quantization_config = None
    device_map = None
    if config.model.qlora_4bit:
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
            bnb_4bit_compute_dtype=dtype,
        )
        device_map = {"": int(__import__("os").environ.get("LOCAL_RANK", "0"))}

    shared: dict[str, Any] = {
        "revision": config.model.revision,
        "trust_remote_code": False,
        "local_files_only": False,
    }
    tokenizer = AutoTokenizer.from_pretrained(config.model.name_or_path, use_fast=True, **shared)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    model = AutoModelForCausalLM.from_pretrained(
        config.model.name_or_path,
        use_safetensors=True,
        dtype=dtype,
        quantization_config=quantization_config,
        device_map=device_map,
        **shared,
    )
    model.config.use_cache = False
    return model, tokenizer


def train(config: LabConfig) -> dict[str, Any]:
    from peft import LoraConfig
    from trl import SFTConfig, SFTTrainer

    train_dataset, eval_dataset, train_report, eval_report = load_and_check_data(config)
    model, tokenizer = build_model_and_tokenizer(config)

    peft_config = LoraConfig(
        r=config.lora.r,
        lora_alpha=config.lora.alpha,
        lora_dropout=config.lora.dropout,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=config.lora.target_modules,
    )
    args = SFTConfig(
        output_dir=config.training.output_dir,
        seed=config.training.seed,
        data_seed=config.training.seed,
        max_length=config.training.max_length,
        num_train_epochs=config.training.num_train_epochs,
        learning_rate=config.training.learning_rate,
        per_device_train_batch_size=config.training.per_device_train_batch_size,
        per_device_eval_batch_size=config.training.per_device_eval_batch_size,
        gradient_accumulation_steps=config.training.gradient_accumulation_steps,
        logging_steps=config.training.logging_steps,
        eval_strategy="steps",
        eval_steps=config.training.eval_steps,
        save_strategy="steps",
        save_steps=config.training.save_steps,
        save_total_limit=2,
        warmup_ratio=config.training.warmup_ratio,
        weight_decay=config.training.weight_decay,
        gradient_checkpointing=config.training.gradient_checkpointing,
        packing=config.training.packing,
        completion_only_loss=True,
        report_to="none",
        push_to_hub=False,
        save_safetensors=True,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
    )
    trainer = SFTTrainer(
        model=model,
        args=args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        processing_class=tokenizer,
        peft_config=peft_config,
    )
    train_result = trainer.train()
    metrics = dict(train_result.metrics)
    evaluation = trainer.evaluate()
    metrics.update(evaluation)
    if "eval_loss" in metrics:
        metrics["eval_perplexity"] = math.exp(min(float(metrics["eval_loss"]), 20))

    output_dir = Path(config.training.output_dir)
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    manifest = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "model": {
            "name_or_path": config.model.name_or_path,
            "revision": config.model.revision,
            "adapter_type": "QLoRA-4bit" if config.model.qlora_4bit else "LoRA",
        },
        "config_fingerprint": config.fingerprint(),
        "data": {
            "train_sha256": file_sha256(config.data.train_file),
            "eval_sha256": file_sha256(config.data.eval_file),
            "train_fingerprint": train_report.fingerprint,
            "eval_fingerprint": eval_report.fingerprint,
            "train_records": len(train_report.records),
            "eval_records": len(eval_report.records),
        },
        "environment": {
            "python": platform.python_version(),
            "platform": platform.platform(),
            "packages": package_versions(),
        },
        "metrics": metrics,
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "run_manifest.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True), encoding="utf-8"
    )
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Train a LoRA/QLoRA SFT adapter")
    parser.add_argument("--config", required=True)
    args = parser.parse_args()
    manifest = train(load_config(args.config))
    print(json.dumps(manifest, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()

