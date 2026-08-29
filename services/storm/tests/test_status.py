from cliniga_storm.cli import status


def test_storm_imports_in_isolated_environment() -> None:
    result = status()
    assert result["installed"] is True
    assert result["mode"] == "research-draft"
