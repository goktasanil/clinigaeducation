# Frontier repository core

This layer strengthens the CliniGA AI engine without copying third-party source trees into this repository.

| Role | Repository | Integration state |
|---|---|---|
| Tool/agent orchestration | `openai/openai-agents-python` | Optional pinned worker adapter |
| Coding-agent baseline | `openai/codex` | Isolated reference runner |
| Reproducible evaluation | `UKGovernmentBEIS/inspect_ai` | Isolated evaluator |
| LLM regression/red-team | `promptfoo/promptfoo` | Restricted isolated evaluator |
| Tool protocol | `modelcontextprotocol/python-sdk` | Already present; allowlisted |
| Coding comparisons | OpenHands, SWE-agent, Aider | Disposable workspaces only |

## Why the repositories are not vendored

Vendoring large agent repositories would duplicate dependency trees, make security updates harder and silently expand the trusted computing base. The reviewed commit, license evidence, security-policy presence and operating constraints are recorded in `ai/security/frontier_upstreams.json` instead.

Only `openai-agents==0.22.0` is approved as an optional Python adapter. It remains outside the base API image and is disabled until explicitly configured. Promptfoo and the coding agents can execute user-controlled code, so they must run without production credentials in isolated, disposable environments.

## Promotion gate

No repository makes the underlying model "the world's best" by itself. A candidate is promoted only after held-out benchmark improvement, unchanged safety gates, acceptable latency/cost and reproducible result artifacts. Benchmark-target prompt tuning and unverified score claims are prohibited.
