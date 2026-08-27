import os

from ai.runtime.controls import SlidingWindowRateLimiter, TTLCache
from ai.security.tenant_auth import authenticate


def test_tenant_auth_isolated(monkeypatch):
    monkeypatch.setenv('CLINIGA_TENANT_KEYS_JSON', '{"tenant-a":"key-a","tenant-b":"key-b"}')
    assert authenticate('tenant-a', 'key-a').tenant_id == 'tenant-a'
    try:
        authenticate('tenant-a', 'key-b')
        assert False, 'cross-tenant key must fail'
    except PermissionError:
        pass


def test_cache_round_trip():
    cache = TTLCache(ttl_seconds=30, max_items=2)
    cache.set('tenant-a:q', {'ok': True})
    assert cache.get('tenant-a:q') == {'ok': True}
    assert cache.get('tenant-b:q') is None


def test_rate_limiter_blocks_after_limit():
    limiter = SlidingWindowRateLimiter(limit=2, window_seconds=60)
    assert limiter.allow('tenant-a')
    assert limiter.allow('tenant-a')
    assert not limiter.allow('tenant-a')
    assert limiter.allow('tenant-b')
