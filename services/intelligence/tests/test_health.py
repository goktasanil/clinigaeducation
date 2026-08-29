from cliniga_intelligence.health import CAPABILITIES, capability_status, missing_capabilities
from cliniga_intelligence.research import paperqa_ready, storm_ready


def test_all_curated_capabilities_are_installed() -> None:
    status = capability_status()
    packages = status["packages"]
    assert set(packages) == set(CAPABILITIES)
    assert missing_capabilities() == []
    assert status["trendyol_mode"] == "read-only"
    assert status["paperqa_runtime_ready"] is True
    assert paperqa_ready() is True


def test_storm_import_surface_is_available() -> None:
    assert storm_ready() is True
