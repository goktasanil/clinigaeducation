from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DomainProfile:
    name: str
    providers: tuple[str, ...]
    capabilities: tuple[str, ...]


_PROFILES: tuple[tuple[tuple[str, ...], DomainProfile], ...] = (
    (
        (
            "paper", "literature", "citation", "evidence", "thesis", "tez", "makale", "yayın",
            "systematic review", "causal", "methodology", "metodoloji", "api test", "data validation",
        ),
        DomainProfile(
            "research",
            (
                "paperqa", "zotero", "biomni", "crawl4ai", "dlt", "dowhy", "dspy",
                "deepeval", "pandera", "schemathesis", "openai-agents",
            ),
            (
                "literature_qa", "citation_grounding", "evidence_synthesis", "research_ingestion",
                "causal_inference", "prompt_optimization", "evaluation", "data_validation", "api_contract_testing",
            ),
        ),
    ),
    (
        (
            "clinical", "trial", "cdisc", "sdtm", "adam", "omop", "redcap", "dicom", "cro", "patient",
            "pharmacovigilance", "survival", "pharmacometrics", "klinik", "hasta", "çalışma", "farmakovijilans",
        ),
        DomainProfile(
            "clinical",
            (
                "pytrials", "redcap-pycap", "dicomweb-client", "dicom-deid", "medspacy", "presidio",
                "cdisc-rules-engine", "pharmaverse-admiral", "pharmaverse-sdtm-oak", "ohdsi-omop-cdm",
                "pharmpy", "lifelines", "chembl-client", "biopython", "gffutils",
            ),
            (
                "clinical_data", "deidentification", "cdisc_validation", "sdtm_adam", "omop_modeling",
                "survival_analysis", "pharmacometrics", "clinical_nlp", "trial_registry", "redcap_integration",
            ),
        ),
    ),
    (
        (
            "rna-seq", "rnaseq", "genomic", "genomics", "transcript", "single-cell", "single cell", "gene",
            "protein", "molecule", "bioinformatics", "cheminformatics", "genomik", "transkriptomik", "omics",
        ),
        DomainProfile(
            "biomed",
            (
                "biomni", "biomed-agent", "biopython", "biotite", "chembl-client", "gffutils",
                "scanpy", "scvi-tools", "deepchem", "rdkit", "pytdc", "pyhealth", "pydeseq2", "gseapy", "ete4",
                "nextflow", "nf-core-rnaseq", "snakemake", "micromamba",
            ),
            (
                "omics_analysis", "molecular_ml", "rna_seq", "single_cell", "cheminformatics",
                "phylogenetics", "therapeutics_benchmarking", "healthcare_ml", "scientific_workflows",
            ),
        ),
    ),
    (
        ("privacy", "pii", "phi", "de-ident", "deident", "anonym", "kvkk", "gdpr", "kişisel veri"),
        DomainProfile(
            "privacy",
            ("presidio", "dicom-deid"),
            ("pii_detection", "safe_redaction", "dicom_deidentification", "privacy_review"),
        ),
    ),
    (
        ("trendyol", "marketplace", "seller", "product price", "stok", "sipariş", "ürün", "satış"),
        DomainProfile(
            "commerce",
            ("trendyol-seller-growth",),
            ("marketplace_read", "product_optimization", "approval_gated_marketplace_write"),
        ),
    ),
    (
        ("seo", "accessibility", "a11y", "lighthouse", "performance", "core web vitals", "erişilebilirlik", "web quality"),
        DomainProfile(
            "quality",
            ("axe-core", "unlighthouse"),
            ("accessibility_audit", "performance_audit", "seo_audit"),
        ),
    ),
)


def select_domain_profiles(task: str) -> list[DomainProfile]:
    text = task.lower()
    selected: list[DomainProfile] = []
    seen: set[str] = set()
    for keywords, profile in _PROFILES:
        if any(keyword in text for keyword in keywords) and profile.name not in seen:
            selected.append(profile)
            seen.add(profile.name)
    return selected


def expert_context(task: str) -> tuple[list[str], list[str], str]:
    profiles = select_domain_profiles(task)
    providers: list[str] = []
    capabilities: list[str] = []
    for profile in profiles:
        providers.extend(profile.providers)
        capabilities.extend(profile.capabilities)
    providers = list(dict.fromkeys(providers))
    capabilities = list(dict.fromkeys(capabilities))
    profile_names = [profile.name for profile in profiles]
    context = (
        f"Selected expert profiles: {', '.join(profile_names) or 'none'}. "
        f"Available expert providers: {', '.join(providers) or 'none'}. "
        "Use only capabilities that are actually installed/configured and never invent tool output. "
        "Prefer privacy/de-identification before processing sensitive clinical data. "
        "All external writes and marketplace mutations remain explicit and approval-gated."
    )
    return providers, capabilities, context
