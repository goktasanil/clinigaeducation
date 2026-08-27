from ai.agents.capability_router import CapabilityRouter
from ai.agents.context_manager import ContextItem, HierarchicalContextManager
from ai.agents.repo_engineer import RepoEngineer, RepoTask
from ai.agents.test_diagnosis import TestFailureDiagnoser
from ai.agents.tool_planner import AdaptiveToolPlanner, ToolCandidate


def test_repo_engineer_plans_validation_and_review():
    files = {"a.py": "print('a')", "b.py": "print('b')"}
    checks = []

    engineer = RepoEngineer(
        read_file=lambda path: files[path],
        run_check=lambda check: checks.append(check) or f"ok:{check}",
    )
    task = RepoTask(
        objective="fix cross-file behavior",
        files=["a.py", "b.py"],
        tests=["pytest -q"],
        constraints=["preserve public API"],
    )
    context = engineer.map_context(task)
    plan = engineer.plan(task, context)
    validation = engineer.validate(task)
    review = engineer.self_review(task.files)

    assert set(context) == {"a.py", "b.py"}
    assert any("smallest coherent" in step for step in plan)
    assert validation == ["ok:pytest -q"]
    assert checks == ["pytest -q"]
    assert any("cross-file" in note.lower() for note in review)


def test_tool_planner_does_not_escalate_risk_after_failure():
    planner = AdaptiveToolPlanner()
    candidates = [
        ToolCandidate("repo.read", "inspect repository", "read", 1),
        ToolCandidate("tests.run", "run tests", "compute", 1),
        ToolCandidate("github.write", "write code", "write", 1),
        ToolCandidate("shell.privileged", "privileged shell", "privileged", 0.1),
    ]

    plan = planner.choose("debug issue", candidates, {"read", "compute"})
    assert plan.ordered_tools == ["repo.read", "tests.run"]

    retry = planner.replan_after_failure("repo.read", candidates, {"read", "compute"})
    assert "shell.privileged" not in retry.ordered_tools
    assert "github.write" not in retry.ordered_tools


def test_capability_router_applies_repo_context_and_failure_skills():
    decision = CapabilityRouter().choose(
        "Fix this multi-file repository CI failure and prepare a minimal patch",
        has_context=True,
        has_test_log=True,
    )
    caps = set(decision.capabilities)
    assert {"repo_engineering", "patch_editing", "self_review"} <= caps
    assert "hierarchical_context" in caps
    assert "test_failure_diagnosis" in caps


def test_hierarchical_context_prefers_high_priority_summaries():
    manager = HierarchicalContextManager(max_chars=500)
    text = manager.build(
        [ContextItem("architecture", "important summary", priority=100, group="summary")],
        [ContextItem("detail", "implementation detail", priority=1, group="code")],
    )
    assert text.index("important summary") < text.index("implementation detail")


def test_failure_diagnosis_preserves_security_controls():
    diagnosis = TestFailureDiagnoser().diagnose("PermissionError: 403 forbidden while running test")
    assert diagnosis.category == "permission"
    assert "do not bypass" in diagnosis.next_action
