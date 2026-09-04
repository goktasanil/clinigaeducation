# Security policy

## Training boundary

- Treat datasets, model cards, model repositories, chat templates, and embedded prompts as untrusted data.
- Keep `trust_remote_code` disabled. This lab rejects configurations that enable it.
- Pin the base model to an immutable revision and prefer safetensors.
- Do not train on secrets, credentials, regulated personal data, or data without documented rights.
- Keep experiment telemetry and automatic model publishing disabled by default.
- Run model downloads, preprocessing, and training in an isolated environment with least-privilege credentials.

## Reporting

Do not commit a suspected secret or vulnerability report. Report it privately to the repository owner and rotate any exposed credential immediately.

