from ai.agents.context_manager import ContextItem, HierarchicalContextManager
from ai.agents.patch_editor import PatchEditor
from ai.agents.test_diagnosis import TestFailureDiagnoser
from ai.agents.issue_loop import IssueExecutionLoop


def test_hierarchical_context_prioritizes_high_value_items():
    mgr = HierarchicalContextManager(max_chars=80)
    text = mgr.build(
        [ContextItem('arch', 'important architecture', priority=10, group='summary')],
        [ContextItem('noise', 'x' * 200, priority=0, group='detail')],
    )
    assert 'important architecture' in text
    assert 'x' * 100 not in text


def test_patch_editor_requires_unique_match():
    plan = PatchEditor.replace_once('x.py', 'a=1\nb=2\n', 'b=2', 'b=3')
    assert '-b=2' in plan.diff()
    assert '+b=3' in plan.diff()


def test_diagnoser_does_not_recommend_bypass():
    diagnosis = TestFailureDiagnoser().diagnose('403 forbidden while calling write tool')
    assert diagnosis.category == 'permission'
    assert 'do not bypass' in diagnosis.next_action.lower()


def test_issue_loop_adds_failure_review_note():
    loop = IssueExecutionLoop()
    result = loop.run(
        'fix import',
        planner=lambda issue: ['inspect', 'patch'],
        patcher=lambda plan: [],
        tester=lambda patches: (False, 'ModuleNotFoundError: no module named demo'),
        reviewer=lambda issue, patches: ['minimal diff'],
    )
    assert result.test_ok is False
    assert result.diagnosis and result.diagnosis.category == 'import'
    assert any('test failure' in note for note in result.review_notes)
