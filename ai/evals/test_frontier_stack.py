import json

from ai.integrations.provider_registry import DEFAULT_PROVIDERS


def test_frontier_stack_is_registered_and_opt_in():
    data = json.load(open('ai/integrations/frontier_stack.json'))
    names = {item['provider'] for item in data['components']}
    required = {
        'vllm', 'sglang', 'transformers', 'ray', 'lm-eval-harness', 'graphrag',
        'graphiti', 'livekit-agents', 'swe-agent', 'openhands', 'aider', 'openfable'
    }
    assert required <= names
    assert required <= set(DEFAULT_PROVIDERS)
    assert all(DEFAULT_PROVIDERS[name].enabled is False for name in required)
    assert all(DEFAULT_PROVIDERS[name].requires_approval_for_writes for name in required)


def test_frontier_stack_has_capability_mapping():
    data = json.load(open('ai/integrations/frontier_stack.json'))
    assert data['goal']
    assert data['policy']
    assert all(item.get('repo') and item.get('capability') for item in data['components'])
