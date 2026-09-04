from __future__ import annotations

import json
from pathlib import Path

from ai.integrations.domain_profiles import expert_context, select_domain_profiles
from ai.integrations.expert_delegation import ExpertDelegator
from ai.integrations.provider_registry import DEFAULT_PROVIDERS

ROOT = Path(__file__).resolve().parents[2]
AI = ROOT / "ai"

EXPECTED_REPOS = {
    "biopython/biopython",
    "biotite-dev/biotite",
    "CamDavidsonPilon/lifelines",
    "cdisc-org/cdisc-rules-engine",
    "chembl/chembl_webresource_client",
    "confident-ai/deepeval",
    "daler/gffutils",
    "data-privacy-stack/presidio",
    "deepchem/deepchem",
    "dequelabs/axe-core",
    "dlt-hub/dlt",
    "etetoolkit/ete",
    "Future-House/paper-qa",
    "hamzaciftci/trendyol-satici-api",
    "harlan-zw/unlighthouse",
    "ImagingDataCommons/dicomweb-client",
    "JINGEWU/BioMedAgent",
    "jvfe/pytrials",
    "langchain-ai/langgraph",
    "mamba-org/micromamba-releases",
    "medspacy/medspacy",
    "mims-harvard/TDC",
    "nextflow-io/nextflow",
    "nf-core/rnaseq",
    "OHDSI/CommonDataModel",
    "openai/openai-agents-python",
    "pharmaverse/admiral",
    "pharmaverse/sdtm.oak",
    "pharmpy/pharmpy",
    "py-why/dowhy",
    "pydicom/deid",
    "rdkit/rdkit",
    "redcap-tools/PyCap",
    "schemathesis/schemathesis",
    "scverse/PyDESeq2",
    "scverse/scanpy",
    "scverse/scvi-tools",
    "snakemake/snakemake",
    "snap-stanford/Biomni",
    "stanfordnlp/dspy",
    "sunlabuiuc/PyHealth",
    "unclecode/crawl4ai",
    "unionai-oss/pandera",
    "zqfang/GSEApy",
}


def _text(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_shared_manifest_is_exactly_44_verified_repositories():
    data = json.loads(_text("ai/integrations/shared_conversation_upstreams.json"))
    repos = {item["repo"] for item in data["repositories"]}
    assert data["verified_repository_count"] == 44
    assert len(data["repositories"]) == 44
    assert repos == EXPECTED_REPOS
    assert len(repos) == len(data["repositories"]), "duplicate upstream repository"


def test_every_manifest_entry_has_install_mode_target_and_profile():
    data = json.loads(_text("ai/integrations/shared_conversation_upstreams.json"))
    for item in data["repositories"]:
        assert item["mode"].strip()
        assert item["install_target"].strip()
        assert item["profile"].strip()


def test_python_install_manifests_cover_shared_stack():
    core = _text("ai/requirements.txt").lower()
    research = _text("ai/requirements-research.txt").lower()
    clinical = _text("ai/requirements-clinical.txt").lower()
    biomed = _text("ai/requirements-biomed-heavy.txt").lower()
    privacy = _text("ai/requirements-privacy.txt").lower()
    cdisc = _text("ai/requirements-cdisc.txt").lower()

    assert "langgraph" in core
    for package in ("paper-qa", "biomni", "openai-agents", "crawl4ai", "dowhy", "pandera", "schemathesis", "dlt", "dspy", "deepeval"):
        assert package in research
    for package in ("biopython", "lifelines", "chembl-webresource-client", "gffutils", "medspacy", "pytrials", "pydicom", "deid", "dicomweb-client", "ete4", "pycap", "pharmpy", "gseapy", "pydeseq2"):
        assert package in clinical
    for package in ("biotite", "deepchem", "rdkit", "scanpy", "scvi-tools", "pyhealth", "snakemake", "pytdc"):
        assert package in biomed
    for package in ("presidio-analyzer", "presidio-anonymizer", "presidio-structured"):
        assert package in privacy
    assert "cdisc-rules-engine" in cdisc


def test_non_python_upstreams_are_pinned_in_isolated_runtimes():
    pipeline = _text("ai/pipelines/Dockerfile")
    standards = _text("ai/standards/Dockerfile")
    biomed_agent = _text("ai/biomed_agent/Dockerfile")
    trendyol = _text("ai/commerce/trendyol/package.json")
    quality = _text("ai/quality/package.json")

    assert "2.9.0-0" in pipeline and "366cd9cd8be14df1ab8ed50352a82111082a36686b2d389fdb79a92c3fafb3e3" in pipeline
    assert "26.04.6" in pipeline and "61a755edbed743cfbb568f3a6c67af68481a2f6a4d6dffcc4295e51318968281" in pipeline
    assert "1f03b53ef799e298f60c813440e961e867017043" in pipeline
    assert "e32e5689d7fd03e224ddbcfc369c332c5df837d9" in standards
    assert "6b5d887aa560c77b3ec983071489725e3046ce1e" in standards
    assert "4a910305b2cb74a4fc2b2c34baf44eb0542ff03f" in standards
    assert "c74911cb31437f2669f4a1fd03176911545f773f" in biomed_agent
    assert "0177ab131c8615d62c030f0d50e978c98dcf04e9" in trendyol
    assert '"axe-core": "4.13.0"' in quality
    assert '"@unlighthouse/cli": "0.18.0"' in quality


def test_domain_routing_activates_installed_experts():
    research_profiles = {p.name for p in select_domain_profiles("Tez için systematic review ve causal methodology geliştir")}
    research_providers, _, _ = expert_context("Tez için systematic review ve causal methodology geliştir")
    assert "research" in research_profiles
    assert {"paperqa", "dspy", "deepeval", "dowhy"} <= set(research_providers)

    clinical_providers, _, _ = expert_context("CRO clinical trial CDISC SDTM REDCap DICOM analizi")
    assert {"cdisc-rules-engine", "redcap-pycap", "dicomweb-client", "presidio", "lifelines"} <= set(clinical_providers)

    biomed_providers, _, _ = expert_context("RNA-seq single-cell genomics pipeline")
    assert {"scanpy", "scvi-tools", "nextflow", "nf-core-rnaseq", "biomni"} <= set(biomed_providers)

    commerce_providers, _, _ = expert_context("Trendyol ürün stok satış optimizasyonu")
    assert "trendyol-seller-growth" in commerce_providers


def test_shared_providers_default_to_disabled_and_writes_remain_gated():
    for spec in DEFAULT_PROVIDERS.values():
        assert spec.enabled is False
    assert DEFAULT_PROVIDERS["trendyol-seller-growth"].requires_approval_for_writes is True
    assert DEFAULT_PROVIDERS["redcap-pycap"].requires_approval_for_writes is True
    assert DEFAULT_PROVIDERS["nextflow"].requires_approval_for_writes is True


def test_expert_delegation_is_off_without_internal_token(monkeypatch):
    monkeypatch.setenv("CLINIGA_RUNTIME_PROFILE", "core")
    monkeypatch.setenv("CLINIGA_RESEARCH_API_URL", "http://research-api:8000")
    monkeypatch.delenv("CLINIGA_INTERNAL_SERVICE_TOKEN", raising=False)
    delegator = ExpertDelegator()
    assert delegator._target("tez literature systematic review") is None


def test_compose_keeps_expert_services_internal_and_token_gated():
    compose = _text("ai/docker-compose.yml")
    assert "CLINIGA_INTERNAL_SERVICE_TOKEN" in compose
    assert "CLINIGA_RESEARCH_API_URL" in compose
    assert "CLINIGA_CLINICAL_API_URL" in compose
    assert "CLINIGA_BIOMED_API_URL" in compose
    for service in ("research-api:", "clinical-api:", "biomed-api:", "trendyol-bridge:"):
        assert service in compose
    assert 'profiles: ["all"]' not in compose  # every expert retains a named profile too
