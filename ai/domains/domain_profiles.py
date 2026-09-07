from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DomainProfile:
    name: str
    goals: tuple[str, ...]
    providers: tuple[str, ...]
    approval_required_actions: tuple[str, ...]
    prohibited_actions: tuple[str, ...] = ()


PROFILES = {
    "cro_growth": DomainProfile(
        name="cro_growth",
        goals=(
            "increase qualified sponsor and biotech leads",
            "improve technical SEO and conversion funnels",
            "surface clinical-research opportunities and evidence-backed content",
            "measure acquisition-to-meeting conversion",
        ),
        providers=("posthog", "matomo", "serpapi", "twenty-crm", "calcom", "graphrag", "n8n"),
        approval_required_actions=("crm.write", "email.send", "calendar.write", "browser.write"),
    ),
    "education_growth": DomainProfile(
        name="education_growth",
        goals=(
            "increase qualified international student leads",
            "improve country-city-university-department discovery",
            "optimize multilingual SEO and landing-page conversion",
            "measure consultation and membership funnels",
        ),
        providers=("posthog", "plausible", "meilisearch", "serpapi", "twenty-crm", "calcom", "n8n"),
        approval_required_actions=("crm.write", "email.send", "calendar.write", "browser.write"),
    ),
    "thesis_copilot": DomainProfile(
        name="thesis_copilot",
        goals=(
            "find and organize relevant literature",
            "build traceable evidence matrices",
            "improve research questions, methods and discussion structure",
            "generate citation-aware summaries without fabricating sources",
        ),
        providers=("zotero", "evidence", "graphrag", "llamaindex", "openfable", "deepeval"),
        approval_required_actions=("library.write", "document.write"),
        prohibited_actions=("fabricate_citations", "invent_results", "misrepresent_authorship"),
    ),
    "trendyol_seller_growth": DomainProfile(
        name="trendyol_seller_growth",
        goals=(
            "improve lawful product discoverability",
            "optimize titles, descriptions, attributes and merchandising",
            "analyze price, margin, stock and conversion performance",
            "prioritize experiments using measured sales outcomes",
        ),
        providers=("posthog", "matomo", "meilisearch", "evidence", "n8n", "trendyol-seller-growth"),
        approval_required_actions=("marketplace.write", "price.write", "inventory.write", "campaign.write"),
        prohibited_actions=(
            "fake_reviews",
            "fake_orders",
            "click_fraud",
            "ranking_manipulation",
            "credential_bypass",
            "platform_restriction_bypass",
        ),
    ),
}


def get_profile(name: str) -> DomainProfile:
    try:
        return PROFILES[name]
    except KeyError as exc:
        raise ValueError(f"unknown domain profile: {name}") from exc
