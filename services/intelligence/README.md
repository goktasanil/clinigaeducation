# CliniGA Intelligence

This service integrates the curated research and marketplace repositories without copying their
application code into the website.

- PaperQA and Docling provide citation-first thesis research and document conversion. STORM runs
  through the isolated sibling service because its pinned OpenAI SDK is incompatible with current
  PaperQA.
- Crawlee collects only explicitly enabled public Trendyol pages, respects `robots.txt`, processes
  at most ten URLs per run and uses one concurrent request.
- DuckDB ranks product datasets, Optuna searches for sustainable prices, and Streamlit provides a
  local decision dashboard.
- The Trendyol seller adapter is read-only and refuses to start when `TRENDYOL_ALLOW_WRITES=true`.

Install and verify:

```bash
uv sync --extra dev
uv sync --project ../storm --extra dev
uv run cliniga-intelligence status --strict
uv run pytest
uv run streamlit run app.py
```

Copy `.env.example` to a secret-managed environment. Never commit seller or research API keys.
