# Advanced AI integration stack

These integrations extend the isolated AI engine without copying upstream source trees.

| Layer | Selected integration | Default state |
|---|---|---|
| RAG pipeline | Haystack 3.1.0 adapter | Opt-in |
| Prompt optimization | DSPy 3.3.1 MIPROv2 adapter | Offline/evaluation only |
| Typed agents | PydanticAI 2.35.1 | Opt-in |
| Durable workflows | Temporal SDK 1.32.0 | Disabled until an address is configured |
| Model telemetry | OpenTelemetry 1.44.0 + Helicone-compatible proxy headers | Content-free; disabled until configured |
| Vector routing | Qdrant 1.19.0 + pgvector-python 0.5.0 | Qdrant default; restricted data can be routed to pgvector |
| Document parsing | Docling Slim 2.123.0 | Optional; local files and approved formats only |
| Scientific evidence | PaperQA 2026.8.12 contract | Restricted optional; offline runner and citations required |
| Independent evaluation | lm-eval 0.4.12 plan contract | Direct install blocked; isolated no-network image only |

## Safety defaults

- Third-party source code is not vendored or executed during repository setup.
- Optional adapters import their SDK only when used.
- Prompt optimization requires a separate evaluation set and never runs in an online request path.
- Telemetry records dimensions, latency, token counts, model, tenant hash and outcome; prompt/response bodies are excluded.
- Helicone credentials are sent only to the explicitly configured Helicone proxy URL.
- Temporal workflows are allowlisted and tenant-scoped; arbitrary workflow names are rejected.
- Vector fallback is fail-closed for confidential and restricted data.
- Private repository contents must not be committed to this public repository.
- Parsed documents are untrusted data and cannot supply runtime instructions.
- Scientific metadata lookups and remote sources are disabled by the PaperQA boundary.
- lm-eval plans disable request caching, remote code and remote task plugins; execution needs explicit known-risk approval.

Install the reviewed integration set with:

```bash
python -m pip install -r ai/requirements.txt -r ai/requirements-integrations.txt
```

Install Docling/PaperQA only in a dedicated reviewed image with `ai/requirements-capabilities.txt`. The file intentionally excludes lm-eval until its recorded blocking findings are resolved or a separately approved isolated evaluator image is supplied.

All model, dataset and external service terms remain separate from the code licenses.

