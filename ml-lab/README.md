# CliniGA ML Lab

Reproducible, model-agnostic supervised fine-tuning (SFT) laboratory for open-weight causal language models. The first release uses the maintained Hugging Face stack: Transformers, TRL, PEFT, Datasets, Accelerate, and PyTorch.

This project does **not** retrain ChatGPT or OpenAI's proprietary model weights. It trains a LoRA/QLoRA adapter for a separately licensed open-weight base model.

## What is included

- Conversational JSONL validation before any GPU work
- Secret, likely PII, duplicate, and train/evaluation leakage checks
- Deterministic train/evaluation split and dataset fingerprint
- LoRA and optional 4-bit QLoRA SFT
- Completion-only loss through conversational prompt/completion records
- `trust_remote_code=False`, safetensors, no automatic Hub upload, and no experiment telemetry
- Run manifest with dataset/config hashes, package versions, and evaluation metrics
- Unit tests that do not download a model

## Prerequisites

- Python 3.11-3.13
- A reviewed open-weight causal language model and its exact immutable revision
- NVIDIA GPU for QLoRA; CPU can only be used for very small smoke tests
- Sufficient disk space for model weights, optimizer state, adapters, and checkpoints

Model code licenses and model-weight/data licenses are separate. Review the model card, weights license, acceptable-use terms, and training-data rights before running the lab.

## Install

Create an isolated environment. Do not put tokens in the repository.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e '.[dev]'
```

PyTorch/CUDA wheels vary by operating system and CUDA driver. If the default PyPI wheel is not appropriate, install the matching official PyTorch wheel first, then install this project.

## Prepare data

Each JSONL line must end with an assistant response:

```json
{"messages":[{"role":"user","content":"What is gradient descent?"},{"role":"assistant","content":"Gradient descent is an optimization method that updates parameters in the direction that reduces a loss function."}]}
```

Use only data you own or are licensed to train on. Do not use real patient, student, passport, payment, credential, or confidential business data.

```bash
python -m ml_lab.prepare \
  --input data/example.jsonl \
  --output-dir data/processed \
  --eval-ratio 0.2 \
  --seed 42
```

The command stops on schema errors or possible secrets and prints warnings for likely PII. Review all warnings before training.

## Configure

Copy `configs/sft.example.toml` to `configs/sft.local.toml`, then set:

- `model.name_or_path`: a local path or reviewed model repository
- `model.revision`: an immutable model commit hash; `main` is rejected
- `data.train_file` and `data.eval_file`
- GPU-appropriate batch size and sequence length

The example intentionally contains a placeholder revision so accidental downloads cannot start training.

## Train

```bash
accelerate config
accelerate launch -m ml_lab.train_sft --config configs/sft.local.toml
```

Outputs are written under `runs/`, which is ignored by Git. A successful run contains the adapter, tokenizer, trainer state, and `run_manifest.json`.

## Verify

```bash
PYTHONPATH=src python -m unittest discover -s tests -v
python -m compileall src tests
```

Passing tests confirms the local data/configuration logic, not model quality. Promote an adapter only after held-out evaluation, task-specific benchmarks, red-team checks, human review, and rollback testing.

## Repository selection

The core stack is intentionally smaller than a bulk clone. See `THIRD_PARTY.md` for the live GitHub maintenance, release, license, and security review recorded on 2026-08-27.
