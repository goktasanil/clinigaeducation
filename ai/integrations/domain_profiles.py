from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DomainProfile:
    name: str
    providers: tuple[str, ...]
    capabilities: tuple[str, ...]


_PROFILES: tuple[tuple[tuple[str, ...], DomainProfile], ...] = (
    (
        ("paper", "literature", "citation", "evidence", "thesis", "tez", "makale", "yayın", "systematic review"),
        DomainProfile(
            "research",
            ("paperqa", "zotero", "biomni", "crawl4ai", "dlt"),
            ("literature_qa", "citation_grounding", "evidence_synthesis", "research_ingestion"),
        ),
    ),
    (
        ("clinical", "trial", "cdisc", "sdtm", "adam", "redcap", "dicom", "cro", "patient", "pharmacovigilance", "klinik", "hasta", "çalışma"),
        DomainProfile(
            "clinical",
            (
                "pytrials", "redcap-pycap", "dicomweb-client", "medspacy", "presidio",
                "cdisc-rules-engine", "pharmaverse-admiral", "pharmaverse-sdtm-oak",
                "ohdsi-omop-cdm", "pharmpy", "lifelines",
            ),
            ("clinical_data", "deidentification", "cdisc_validation", "survival_analysis", "pharmacometrics"),
        ),
    ),
    (
        ("rna-seq", "rnaseq", "genomic", "genomics", "transcript", "single-cell", "gene", "protein", "molecule", "bioinformatics", "genomik"),
        DomainProfile(
            "biomed",
            (
                "biomni", "biomed-agent", "scanpy", "scvi-tools", "deepchem", "rdkit",
                "pytdc", "pydeseq2", "gseapy", "ete4", "nextflow", "nf-core-rnaseq", "snakemake",
            ),
            ("omics_analysis", "molecular_ml", "rna_seq", "single_cell", "scientific_workflows"),
        ),
    ),
    (
        ("privacy", "pii", "phi", "de-ident", "deident", "anonym", "kvkk", "gdpr"),
        DomainProfile(
            "privacy",
            ("presidio",),
            ("pii_detection", "safe_redaction", "privacy_review"),
        ),
    ),
    (
        ("trendyol", "marketplace", "seller", "product price", "stok", "sipariş", "ürün"),
        DomainProfile(
            "commerce",
            ("trendyol-seller-growth",),
            ("marketplace_read", "approval_gated_marketplace_write"),
        ),
    ),
    (
        ("seo", "accessibility", "a11y", "lighthouse", "performance", "core web vitals", "erişilebilirlik"),
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
        "Use these as domain-specialist capabilities when installed/configured. "
        "Never invent tool results. External writes remain approval-gated."
    )
    return providers, capabilities, context
