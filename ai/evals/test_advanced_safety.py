import pytest

from ai.agents.coordination import AgentTask, CoordinationBoard
from ai.security.defensive_capabilities import AdaptivePlanner, DefensiveCapabilityPolicy, SearchTarget


def test_delegation_stays_in_parent_scope():
    board = CoordinationBoard()
    task = AgentTask(
        title="Analyze portal bug",
        objective="analyze portal bug",
        parent_objective="analyze portal payment bug",
        created_by="planner",
    )
    saved = board.delegate(task)
    assert saved.id in board.tasks


def test_out_of_scope_delegation_is_rejected():
    board = CoordinationBoard()
    task = AgentTask(
        title="Unrelated attack",
        objective="attack external infrastructure",
        parent_objective="analyze portal payment bug",
        created_by="planner",
    )
    with pytest.raises(PermissionError):
        board.delegate(task)


def test_escape_and_credential_actions_are_denied():
    policy = DefensiveCapabilityPolicy()
    for action in ["sandbox.escape", "network.bypass", "credential.collect", "privilege_escalation"]:
        with pytest.raises(PermissionError):
            policy.ensure_action_allowed(action)


def test_defensive_review_requires_authorization():
    policy = DefensiveCapabilityPolicy()
    with pytest.raises(PermissionError):
        policy.ensure_authorized_target(SearchTarget(name="third-party", authorized=False))
    policy.ensure_authorized_target(SearchTarget(name="owned-repo", authorized=True))


def test_adaptive_planner_does_not_weaken_security():
    planner = AdaptivePlanner()
    options = planner.next_safe_options(
        "browser.read",
        ["network.bypass", "rag.search", "credential.collect", "memory.search"],
    )
    assert options == ["rag.search", "memory.search"]
