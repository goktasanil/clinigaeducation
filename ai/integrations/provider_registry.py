from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

ProviderKind = Literal[
    "llm", "rag", "browser", "orchestrator", "workflow", "backend",
    "observability", "validator", "eval", "optimizer", "typed_agent",
    "coding_agent", "inference", "distributed", "memory", "multimodal",
    "analytics", "search", "crm", "scheduling", "research", "commerce",
    "privacy", "standards", "pipeline", "quality", "clinical", "biomed",
]


@dataclass(frozen=True)
class ProviderSpec:
    name: str
    kind: ProviderKind
    enabled: bool = False
    endpoint: str | None = None
    requires_approval_for_writes: bool = True


DEFAULT_PROVIDERS = {
    "litellm": ProviderSpec("litellm", "llm"),
    "ollama": ProviderSpec("ollama", "llm"),
    "gemini-cli": ProviderSpec("gemini-cli", "llm"),
    "llamaindex": ProviderSpec("llamaindex", "rag"),
    "haystack": ProviderSpec("haystack", "rag"),
    "openfable": ProviderSpec("openfable", "rag"),
    "graphrag": ProviderSpec("graphrag", "rag"),
    "dspy": ProviderSpec("dspy", "optimizer"),
    "stagehand": ProviderSpec("stagehand", "browser"),
    "crewai": ProviderSpec("crewai", "orchestrator"),
    "autogen": ProviderSpec("autogen", "orchestrator"),
    "smolagents": ProviderSpec("smolagents", "orchestrator"),
    "pydantic-ai": ProviderSpec("pydantic-ai", "typed_agent"),
    "swe-agent": ProviderSpec("swe-agent", "coding_agent"),
    "openhands": ProviderSpec("openhands", "coding_agent"),
    "aider": ProviderSpec("aider", "coding_agent"),
    "n8n": ProviderSpec("n8n", "workflow"),
    "temporal": ProviderSpec("temporal", "workflow"),
    "dagster": ProviderSpec("dagster", "workflow"),
    "ray": ProviderSpec("ray", "distributed"),
    "supabase": ProviderSpec("supabase", "backend"),
    "phoenix": ProviderSpec("phoenix", "observability"),
    "helicone": ProviderSpec("helicone", "observability"),
    "guardrails": ProviderSpec("guardrails", "validator"),
    "deepeval": ProviderSpec("deepeval", "eval"),
    "openai-evals": ProviderSpec("openai-evals", "eval"),
    "lm-eval-harness": ProviderSpec("lm-eval-harness", "eval"),
    "vllm": ProviderSpec("vllm", "inference"),
    "sglang": ProviderSpec("sglang", "inference"),
    "transformers": ProviderSpec("transformers", "inference"),
    "graphiti": ProviderSpec("graphiti", "memory"),
    "livekit-agents": ProviderSpec("livekit-agents", "multimodal"),
    "posthog": ProviderSpec("posthog", "analytics"),
    "matomo": ProviderSpec("matomo", "analytics"),
    "plausible": ProviderSpec("plausible", "analytics"),
    "meilisearch": ProviderSpec("meilisearch", "search"),
    "twenty-crm": ProviderSpec("twenty-crm", "crm"),
    "calcom": ProviderSpec("calcom", "scheduling"),
    "zotero": ProviderSpec("zotero", "research"),
    "evidence": ProviderSpec("evidence", "research"),
    "serpapi": ProviderSpec("serpapi", "search"),
    "trendyol-seller-growth": ProviderSpec("trendyol-seller-growth", "commerce", endpoint="http://trendyol-bridge:8010"),

    # Shared-conversation expert stack.
    "paperqa": ProviderSpec("paperqa", "research"),
    "biomni": ProviderSpec("biomni", "biomed"),
    "openai-agents": ProviderSpec("openai-agents", "orchestrator"),
    "crawl4ai": ProviderSpec("crawl4ai", "research"),
    "dowhy": ProviderSpec("dowhy", "research"),
    "pandera": ProviderSpec("pandera", "validator"),
    "schemathesis": ProviderSpec("schemathesis", "validator"),
    "dlt": ProviderSpec("dlt", "pipeline"),
    "presidio": ProviderSpec("presidio", "privacy", requires_approval_for_writes=False),
    "cdisc-rules-engine": ProviderSpec("cdisc-rules-engine", "standards"),
    "pharmaverse-admiral": ProviderSpec("pharmaverse-admiral", "standards"),
    "pharmaverse-sdtm-oak": ProviderSpec("pharmaverse-sdtm-oak", "standards"),
    "ohdsi-omop-cdm": ProviderSpec("ohdsi-omop-cdm", "standards"),
    "nextflow": ProviderSpec("nextflow", "pipeline"),
    "nf-core-rnaseq": ProviderSpec("nf-core-rnaseq", "pipeline"),
    "micromamba": ProviderSpec("micromamba", "pipeline", requires_approval_for_writes=False),
    "biomed-agent": ProviderSpec("biomed-agent", "biomed"),
    "biopython": ProviderSpec("biopython", "biomed", requires_approval_for_writes=False),
    "biotite": ProviderSpec("biotite", "biomed", requires_approval_for_writes=False),
    "chembl-client": ProviderSpec("chembl-client", "clinical", requires_approval_for_writes=False),
    "gffutils": ProviderSpec("gffutils", "biomed", requires_approval_for_writes=False),
    "dicom-deid": ProviderSpec("dicom-deid", "privacy", requires_approval_for_writes=False),
    "pytrials": ProviderSpec("pytrials", "clinical", requires_approval_for_writes=False),
    "redcap-pycap": ProviderSpec("redcap-pycap", "clinical"),
    "dicomweb-client": ProviderSpec("dicomweb-client", "clinical"),
    "medspacy": ProviderSpec("medspacy", "clinical", requires_approval_for_writes=False),
    "pharmpy": ProviderSpec("pharmpy", "clinical", requires_approval_for_writes=False),
    "lifelines": ProviderSpec("lifelines", "clinical", requires_approval_for_writes=False),
    "pydeseq2": ProviderSpec("pydeseq2", "biomed", requires_approval_for_writes=False),
    "gseapy": ProviderSpec("gseapy", "biomed", requires_approval_for_writes=False),
    "pytdc": ProviderSpec("pytdc", "biomed", requires_approval_for_writes=False),
    "scanpy": ProviderSpec("scanpy", "biomed", requires_approval_for_writes=False),
    "scvi-tools": ProviderSpec("scvi-tools", "biomed", requires_approval_for_writes=False),
    "deepchem": ProviderSpec("deepchem", "biomed", requires_approval_for_writes=False),
    "rdkit": ProviderSpec("rdkit", "biomed", requires_approval_for_writes=False),
    "pyhealth": ProviderSpec("pyhealth", "biomed", requires_approval_for_writes=False),
    "snakemake": ProviderSpec("snakemake", "pipeline"),
    "ete4": ProviderSpec("ete4", "biomed", requires_approval_for_writes=False),
    "axe-core": ProviderSpec("axe-core", "quality", requires_approval_for_writes=False),
    "unlighthouse": ProviderSpec("unlighthouse", "quality", requires_approval_for_writes=False),
}


def list_provider_names() -> list[str]:
    return sorted(DEFAULT_PROVIDERS)
