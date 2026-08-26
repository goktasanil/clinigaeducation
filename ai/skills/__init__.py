from .registry import registry

# Import modules for registration side-effects.
try:
    from . import memory  # noqa: F401
except Exception:
    pass

try:
    from . import browser  # noqa: F401
except Exception:
    pass

try:
    from . import search_fanout  # noqa: F401
except Exception:
    pass

try:
    from . import defensive_review  # noqa: F401
except Exception:
    pass

__all__ = ["registry"]
