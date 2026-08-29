from ai.domains.domain_profiles import PROFILES, get_profile
from ai.integrations.provider_registry import DEFAULT_PROVIDERS


def test_all_profile_providers_exist():
    for profile in PROFILES.values():
        assert set(profile.providers) <= set(DEFAULT_PROVIDERS)


def test_all_external_writes_are_explicitly_approval_gated():
    for profile in PROFILES.values():
        assert profile.approval_required_actions


def test_thesis_profile_forbids_research_misconduct():
    profile = get_profile("thesis_copilot")
    assert {"fabricate_citations", "invent_results", "misrepresent_authorship"} <= set(profile.prohibited_actions)


def test_trendyol_profile_forbids_marketplace_abuse():
    profile = get_profile("trendyol_seller_growth")
    forbidden = set(profile.prohibited_actions)
    assert {"fake_reviews", "fake_orders", "click_fraud", "credential_bypass", "platform_restriction_bypass"} <= forbidden


def test_growth_profiles_include_measurement_and_crm():
    for name in ("cro_growth", "education_growth"):
        providers = set(get_profile(name).providers)
        assert "posthog" in providers
        assert "twenty-crm" in providers
