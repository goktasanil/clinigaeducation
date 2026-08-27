from __future__ import annotations

import asyncio
import os
import unittest
from unittest.mock import patch

from ai.agents.typed_agent import TypedAgentOutput, TypedAgentRunner
from ai.observability.model_telemetry import HeliconeConfig, tenant_hash
from ai.rag.haystack_dspy import DSPyPromptOptimizer, HaystackPipelineAdapter
from ai.rag.vector_router import DataSensitivity, VectorDatabaseRouter
from ai.workflows.temporal_gateway import DurableTask, TemporalGateway


class FakePipeline:
    def run(self, *, data, include_outputs_from=None):
        return {"data": data, "included": include_outputs_from}


class FakeOptimizer:
    def __init__(self, **kwargs):
        self.kwargs = kwargs

    def compile(self, program, trainset):
        return {"program": program, "train": len(trainset)}


class FakeAgentResult:
    output = {"answer": "ok", "citations": [], "confidence": 0.8, "requires_human_review": True}


class FakeAgent:
    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs

    async def run(self, prompt, deps=None):
        return FakeAgentResult()


class FakeVectorBackend:
    def search(self, query, *, tenant_id, limit):
        return [{"text": query, "tenant_id": tenant_id, "score": 1.0}]


class FakeWorkflowHandle:
    first_execution_run_id = "run-1"


class FakeTemporalClient:
    def __init__(self):
        self.calls = []

    async def start_workflow(self, *args, **kwargs):
        self.calls.append((args, kwargs))
        return FakeWorkflowHandle()


class AdvancedStackTests(unittest.TestCase):
    def test_haystack_adapter_preserves_explicit_pipeline(self):
        result = HaystackPipelineAdapter(FakePipeline()).run({"retriever": {"query": "x"}}, {"retriever"})
        self.assertEqual(result["included"], {"retriever"})

    def test_dspy_optimizer_blocks_data_leakage(self):
        train = [{"id": str(i)} for i in range(8)]
        evaluation = [{"id": "0"}] + [{"id": f"e{i}"} for i in range(3)]
        optimizer = DSPyPromptOptimizer(lambda *_: True, optimizer_factory=FakeOptimizer)
        with self.assertRaisesRegex(ValueError, "overlap"):
            optimizer.compile("program", trainset=train, evalset=evaluation)

    def test_dspy_optimizer_compiles_with_disjoint_data(self):
        train = [{"id": str(i)} for i in range(8)]
        evaluation = [{"id": f"e{i}"} for i in range(4)]
        optimized, report = DSPyPromptOptimizer(
            lambda *_: True, optimizer_factory=FakeOptimizer
        ).compile("program", trainset=train, evalset=evaluation)
        self.assertEqual(optimized["train"], 8)
        self.assertEqual(report.evaluation_examples, 4)

    def test_typed_agent_validates_output(self):
        runner = TypedAgentRunner("test:model", instructions="safe", agent_factory=FakeAgent)
        output = asyncio.run(runner.run("hello"))
        self.assertIsInstance(output, TypedAgentOutput)
        self.assertEqual(output.answer, "ok")

    def test_helicone_requires_explicit_https_proxy(self):
        config = HeliconeConfig("http://proxy.example", "secret")
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(ValueError, "HTTPS"):
                config.validate()

    def test_telemetry_hashes_tenant(self):
        self.assertNotEqual(tenant_hash("tenant-a"), "tenant-a")
        self.assertEqual(len(tenant_hash("tenant-a")), 16)

    def test_vector_router_fails_closed_for_restricted_data(self):
        router = VectorDatabaseRouter({"qdrant": FakeVectorBackend()})
        with self.assertRaisesRegex(RuntimeError, "pgvector"):
            router.search("x", tenant_id="tenant-a", sensitivity=DataSensitivity.RESTRICTED)

    def test_vector_router_tags_selected_backend(self):
        router = VectorDatabaseRouter({"qdrant": FakeVectorBackend(), "pgvector": FakeVectorBackend()})
        rows = router.search("x", tenant_id="tenant-a", sensitivity=DataSensitivity.CONFIDENTIAL)
        self.assertEqual(rows[0]["vector_backend"], "pgvector")

    def test_temporal_gateway_allowlists_and_scopes_workflow(self):
        client = FakeTemporalClient()

        async def factory(address, namespace):
            self.assertEqual((address, namespace), ("temporal:7233", "default"))
            return client

        gateway = TemporalGateway(address="temporal:7233", client_factory=factory)
        task = DurableTask(tenant_id="tenant-a", subject="user-a", task_id="task-1", payload={"x": 1})
        handle = asyncio.run(gateway.start("cliniga-agent", task))
        self.assertEqual(handle.workflow_id, "tenant-a:cliniga-agent:task-1")
        self.assertEqual(client.calls[0][1]["task_queue"], "cliniga-ai")

    def test_temporal_gateway_rejects_arbitrary_workflow(self):
        gateway = TemporalGateway(address="temporal:7233", client_factory=lambda *_: FakeTemporalClient())
        task = DurableTask(tenant_id="tenant-a", subject="user-a", task_id="task-1")
        with self.assertRaisesRegex(PermissionError, "allowlisted"):
            asyncio.run(gateway.start("arbitrary-shell", task))


if __name__ == "__main__":
    unittest.main()
