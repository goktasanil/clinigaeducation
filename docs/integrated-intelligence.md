# Integrated intelligence architecture

## Website quality

The existing application already uses shadcn/Radix components and react-i18next. Lighthouse CI now
audits the production build on every pull request and blocks material performance, accessibility,
best-practice or SEO regressions.

## Thesis research

`services/intelligence` combines PaperQA and Docling, while `services/storm` keeps STORM in a
separate dependency environment. Docling converts local thesis sources
to structured Markdown; PaperQA answers questions against selected documents with citations; STORM
provides multi-perspective outline and long-form research workflows when an approved LLM and search
provider are configured. Generated text remains a research draft and must be checked against the
original sources before academic submission. The isolation is required because STORM 1.1.1 pins
DSPy/OpenAI SDK 1.x while current PaperQA requires OpenAI SDK 2.x.

## Marketplace intelligence

The same service combines Crawlee, DuckDB, Optuna and Streamlit. Public-page collection is disabled
by default, restricted to HTTPS Trendyol hosts, robots-aware, single-concurrency and capped at ten
URLs. Product economics explicitly reserve commission, shipping, tax and inflation before a target
margin is accepted.

The Python MCP adapter and TypeScript SDK adapter both expose only product/order reads. They default
to stage and refuse to start when write mode is enabled. The n8n community node is installed for
isolated workflow development but is not attached to production automatically.

## Production boundary

No real Trendyol, OpenAI or search credentials belong in git. Production writes, price changes,
stock changes, customer answers and scheduled crawls require a separate approval, secret-manager
configuration, sandbox evidence and read-back verification. This integration improves decision
quality; it does not guarantee sales or profit.
