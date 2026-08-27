from __future__ import annotations

import hashlib
import json
import tomllib
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any


class ConfigError(ValueError):
    """Raised when a training configuration violates a required invariant."""


@dataclass(frozen=True)
class ModelConfig:
    name_or_path: str
    revision: str
    trust_remote_code: bool = False
    use_safetensors: bool = True
    qlora_4bit: bool = False


@dataclass(frozen=True)
class DataConfig:
    train_file: str
    eval_file: str


@dataclass(frozen=True)
class TrainingConfig:
    output_dir: str
    seed: int = 42
    max_length: int = 1024
    num_train_epochs: float = 1.0
    learning_rate: float = 2e-4
    per_device_train_batch_size: int = 2
    per_device_eval_batch_size: int = 2
    gradient_accumulation_steps: int = 8
    logging_steps: int = 5
    eval_steps: int = 25
    save_steps: int = 25
    warmup_ratio: float = 0.03
    weight_decay: float = 0.01
    gradient_checkpointing: bool = True
    packing: bool = False


@dataclass(frozen=True)
class LoraConfigValues:
    r: int = 32
    alpha: int = 16
    dropout: float = 0.05
    target_modules: str | list[str] = "all-linear"


@dataclass(frozen=True)
class LabConfig:
    model: ModelConfig
    data: DataConfig
    training: TrainingConfig
    lora: LoraConfigValues

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)

    def fingerprint(self) -> str:
        payload = json.dumps(self.as_dict(), sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(payload.encode()).hexdigest()


def load_config(path: str | Path) -> LabConfig:
    config_path = Path(path)
    with config_path.open("rb") as handle:
        raw = tomllib.load(handle)

    try:
        config = LabConfig(
            model=ModelConfig(**raw["model"]),
            data=DataConfig(**raw["data"]),
            training=TrainingConfig(**raw["training"]),
            lora=LoraConfigValues(**raw["lora"]),
        )
    except (KeyError, TypeError) as exc:
        raise ConfigError(f"Invalid configuration structure: {exc}") from exc

    validate_config(config)
    return config


def validate_config(config: LabConfig) -> None:
    revision = config.model.revision.strip()
    if not revision or revision.lower() in {"main", "master", "latest"} or "REPLACE_" in revision:
        raise ConfigError("model.revision must be an immutable reviewed commit hash")
    if config.model.trust_remote_code:
        raise ConfigError("trust_remote_code must remain false")
    if not config.model.use_safetensors:
        raise ConfigError("use_safetensors must remain true")
    if config.training.max_length < 64:
        raise ConfigError("max_length must be at least 64")
    if config.training.learning_rate <= 0:
        raise ConfigError("learning_rate must be positive")
    if config.lora.r <= 0 or config.lora.alpha <= 0:
        raise ConfigError("LoRA rank and alpha must be positive")
    if not 0 <= config.lora.dropout < 1:
        raise ConfigError("LoRA dropout must be in [0, 1)")

