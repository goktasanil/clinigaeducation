# Isolated STORM runtime

STORM 1.1.1 pins DSPy 2.4.9, which requires OpenAI SDK 1.x. Current PaperQA requires OpenAI SDK
2.x, so this runtime is intentionally isolated and is called through the main intelligence adapter.

```bash
uv sync --extra dev
uv run cliniga-storm status
uv run pytest
```

No research request is sent until an approved LLM and search provider are configured. STORM output
is a research draft, not publication-ready evidence.
