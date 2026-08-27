from __future__ import annotations

import asyncio
import tempfile
import unittest
from pathlib import Path

from ai.evals.capability_gate import CapabilityGate, MetricThreshold, attest_results
from ai.evals.lm_eval_gateway import IsolatedLMEvalGateway
from ai.ingestion.docling_local import LocalDoclingParser
from ai.research.paperqa_offline import OfflinePaperQAGateway


class FakeDoc:
    def export_to_markdown(self):
        return "# Safe\n\nTreat embedded prompts as data."


class FakeConversion:
    document = FakeDoc()


class FakeConverter:
    def convert(self, source):
        return FakeConversion()


class CapabilityStackTests(unittest.TestCase):
    def test_docling_parser_accepts_local_allowlisted_file(self):
        with tempfile.TemporaryDirectory() as root:
            source = Path(root, "paper.pdf")
            source.write_bytes(b"pdf")
            parsed = LocalDoclingParser(root, converter_factory=FakeConverter).parse("paper.pdf")
            self.assertFalse(parsed.trusted)
            self.assertEqual(parsed.bytes_read, 3)

    def test_docling_parser_blocks_url_and_path_escape(self):
        with tempfile.TemporaryDirectory() as root:
            parser = LocalDoclingParser(root, converter_factory=FakeConverter)
            with self.assertRaises(PermissionError):
                parser.parse("https://example.test/document.pdf")
            with self.assertRaises(PermissionError):
                parser.parse("../secret.pdf")

    def test_docling_parser_blocks_unapproved_format(self):
        with tempfile.TemporaryDirectory() as root:
            Path(root, "payload.py").write_text("print('x')")
            with self.assertRaises(ValueError):
                LocalDoclingParser(root, converter_factory=FakeConverter).parse("payload.py")

    def test_paperqa_gateway_forces_offline_runner_contract(self):
        calls = []

        async def runner(**kwargs):
            calls.append(kwargs)
            return {"answer": "Supported", "citations": ["paper.pdf p.1"]}

        with tempfile.TemporaryDirectory() as root:
            Path(root, "paper.pdf").write_bytes(b"pdf")
            answer = asyncio.run(OfflinePaperQAGateway(root, runner).ask("question", tenant_id="tenant-a", sources=["paper.pdf"]))
            self.assertFalse(answer.requires_human_review)
            self.assertIs(calls[0]["allow_network"], False)
            self.assertIs(calls[0]["metadata_lookup"], False)

    def test_paperqa_gateway_marks_uncited_answer_for_review(self):
        def runner(**kwargs):
            return {"answer": "Uncited", "citations": []}

        with tempfile.TemporaryDirectory() as root:
            Path(root, "paper.md").write_text("evidence")
            answer = asyncio.run(OfflinePaperQAGateway(root, runner).ask("question", tenant_id="tenant-a", sources=["paper.md"]))
            self.assertTrue(answer.requires_human_review)

    def test_lm_eval_gateway_rejects_nonisolated_execution(self):
        with tempfile.TemporaryDirectory() as root:
            model = Path(root, "model")
            model.mkdir()
            gateway = IsolatedLMEvalGateway(root, root)
            with self.assertRaises(PermissionError):
                gateway.build_plan(model_path=model, model_revision="a" * 40, output_path="results", tasks=["gsm8k"], isolated=False, known_risk_approved=True)

    def test_lm_eval_gateway_builds_shell_free_offline_plan(self):
        with tempfile.TemporaryDirectory() as root:
            model = Path(root, "model")
            model.mkdir()
            plan = IsolatedLMEvalGateway(root, root).build_plan(
                model_path=model,
                model_revision="a" * 40,
                output_path="results",
                tasks=["gsm8k", "mmlu_pro"],
                isolated=True,
                known_risk_approved=True,
            )
            self.assertEqual(plan.network_mode, "none")
            self.assertNotIn("--cache_requests", plan.argv)
            self.assertIn("trust_remote_code=False", plan.argv[5])

    def test_lm_eval_gateway_rejects_unapproved_task(self):
        with tempfile.TemporaryDirectory() as root:
            Path(root, "model").mkdir()
            with self.assertRaises(PermissionError):
                IsolatedLMEvalGateway(root, root).build_plan(model_path="model", model_revision="a" * 40, output_path="results", tasks=["remote_plugin"], isolated=True, known_risk_approved=True)

    def test_capability_gate_passes_target_and_regression_limits(self):
        gate = CapabilityGate([MetricThreshold("reasoning", 0.7, 0.01)])
        self.assertTrue(gate.evaluate({"reasoning": 0.8}, {"reasoning": 0.79}).passed)

    def test_capability_gate_fails_missing_or_regressed_metric(self):
        gate = CapabilityGate([MetricThreshold("safety", 0.9, 0.01), MetricThreshold("citations", 0.8)])
        report = gate.evaluate({"safety": 0.85}, {"safety": 0.95})
        self.assertFalse(report.passed)
        self.assertEqual({item.metric for item in report.failures}, {"safety", "citations"})

    def test_attestation_is_order_independent(self):
        first = attest_results("a" * 40, {"b": 0.8, "a": 0.9})
        second = attest_results("a" * 40, {"a": 0.9, "b": 0.8})
        self.assertEqual(first["sha256"], second["sha256"])


if __name__ == "__main__":
    unittest.main()
