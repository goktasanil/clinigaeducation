from ai.agents.repo_engineer import RepoEngineer, RepoTask
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
