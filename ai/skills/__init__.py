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

__all__ = ["registry"]
