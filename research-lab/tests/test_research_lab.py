from pathlib import Path
import sys
import unittest


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from cliniga_research.evidence import EvidenceMatrix, EvidenceRecord, normalize_doi  # noqa: E402
from cliniga_research.integrations import (  # noqa: E402
    ResearchActivation,
    ResearchIntegrationRegistry,
)
from cliniga_research.prisma import PrismaFlow  # noqa: E402
from cliniga_research.router import ToolRouter  # noqa: E402


class EvidenceTests(unittest.TestCase):
    def sample(self) -> EvidenceRecord:
        return EvidenceRecord(
            key="smith2026",
            title="A reproducible study",
            year=2026,
            study_type="cohort",
            finding="An association was observed.",
            limitation="Residual confounding remains possible.",
            risk_of_bias="moderate",
            doi="https://doi.org/10.1234/Example.1",
            sample_size=120,
        )

    def test_normalizes_doi(self) -> None:
        self.assertEqual(normalize_doi("doi:10.1234/Example.1"), "10.1234/example.1")

    def test_requires_provenance(self) -> None:
        with self.assertRaises(ValueError):
            EvidenceRecord("x", "Title", 2026, "review", "Finding", "Limit", "low")

    def test_rejects_duplicate_source_and_unknown_citation(self) -> None:
        matrix = EvidenceMatrix()
        matrix.add(self.sample())
        with self.assertRaises(ValueError):
            matrix.add(self.sample())
        with self.assertRaises(ValueError):
            matrix.validate_citations({"missing"})


class PrismaTests(unittest.TestCase):
    def test_valid_flow(self) -> None:
        PrismaFlow(100, 10, 90, 60, 30, 20, 10).validate()

    def test_invalid_flow(self) -> None:
        with self.assertRaises(ValueError):
            PrismaFlow(100, 10, 80, 60, 30, 20, 10).validate()


class RouterTests(unittest.TestCase):
    def test_routes_only_reviewed_runtime_tools(self) -> None:
        router = ToolRouter.from_json(ROOT / "config" / "upstreams.json")
        self.assertEqual(len(router.all()), 20)
        clinical = {row.repository for row in router.for_profile("clinical-standards")}
        self.assertIn("cdisc-org/cdisc-rules-engine", clinical)
        self.assertNotIn("OHDSI/CommonDataModel", clinical)

    def test_all_tools_are_pinned(self) -> None:
        router = ToolRouter.from_json(ROOT / "config" / "upstreams.json")
        self.assertTrue(all(len(row.commit) == 40 for row in router.all()))

    def test_every_runtime_tool_has_a_default_off_integration(self) -> None:
        router = ToolRouter.from_json(ROOT / "config" / "upstreams.json")
        registry = ResearchIntegrationRegistry.from_json(
            ROOT / "config" / "integration-profiles.json", router
        )
        self.assertEqual(len(registry.all()), 10)
        statuses = registry.status(
            module_probe=lambda _: True,
            command_probe=lambda _: True,
        )
        self.assertTrue(all(row.activation == "disabled" for row in statuses))
        self.assertFalse(
            next(row for row in statuses if row.repository == "pharmaverse/admiral").available
        )

    def test_research_activation_requires_rights_and_deidentification(self) -> None:
        router = ToolRouter.from_json(ROOT / "config" / "upstreams.json")
        registry = ResearchIntegrationRegistry.from_json(
            ROOT / "config" / "integration-profiles.json", router
        )
        request = ResearchActivation(
            repository="Future-House/paper-qa",
            operator="thesis-reviewer",
            data_class="confidential",
            human_approved=True,
            dataset_rights_confirmed=True,
        )
        with self.assertRaises(PermissionError):
            registry.authorize(request)

    def test_blocked_research_tool_cannot_be_activated(self) -> None:
        router = ToolRouter.from_json(ROOT / "config" / "upstreams.json")
        registry = ResearchIntegrationRegistry.from_json(
            ROOT / "config" / "integration-profiles.json", router
        )
        with self.assertRaises(PermissionError):
            registry.authorize(
                ResearchActivation(
                    repository="JINGEWU/BioMedAgent",
                    operator="thesis-reviewer",
                    data_class="public",
                    human_approved=True,
                    dataset_rights_confirmed=True,
                )
            )


if __name__ == "__main__":
    unittest.main()
