import os
from datasets import load_dataset
from peft import LoraConfig
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from trl import SFTTrainer

MODEL_NAME = os.getenv("CLINIGA_MODEL", "Qwen/Qwen3-8B")
MODEL_REVISION = os.getenv("CLINIGA_MODEL_REVISION", "").strip()
DATA_PATH = os.getenv("CLINIGA_TRAIN_DATA", "ai/data/train.jsonl")
OUTPUT_DIR = os.getenv("CLINIGA_ADAPTER_OUT", "ai/outputs/cliniga-lora")


def format_row(row, tokenizer):
    messages = row.get("messages")
    if not messages:
        messages = [
            {"role": "system", "content": row.get("system", "You are CliniGA AI.")},
            {"role": "user", "content": row["user"]},
            {"role": "assistant", "content": row["assistant"]},
        ]
    return tokenizer.apply_chat_template(messages, tokenize=False)


def main():
    if not MODEL_REVISION:
        raise RuntimeError("CLINIGA_MODEL_REVISION must pin an immutable Hugging Face model revision")
    # The built-in JSON dataset loader reads only the explicitly configured local data file.
    dataset = load_dataset("json", data_files=DATA_PATH, split="train")  # nosec B615
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME,
        revision=MODEL_REVISION,
        trust_remote_code=False,
    )
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        revision=MODEL_REVISION,
        device_map="auto",
        torch_dtype="auto",
        trust_remote_code=False,
    )
    peft_config = LoraConfig(
        r=32,
        lora_alpha=64,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )
    args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=16,
        learning_rate=1e-4,
        num_train_epochs=2,
        logging_steps=10,
        save_steps=100,
        bf16=True,
        gradient_checkpointing=True,
        report_to="none",
    )
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        formatting_func=lambda row: format_row(row, tokenizer),
        args=args,
    )
    trainer.train()
    trainer.save_model(OUTPUT_DIR)


if __name__ == "__main__":
    main()
