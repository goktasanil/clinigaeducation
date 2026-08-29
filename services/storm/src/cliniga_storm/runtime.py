from __future__ import annotations

import os
from pathlib import Path
import tempfile
from typing import Any


def import_runner() -> Any:
    """Import STORM while confining legacy caches to a writable service directory."""
    cache_home = Path(
        os.environ.get(
            "CLINIGA_STORM_CACHE_HOME",
            str(Path(tempfile.gettempdir()) / "cliniga-storm-home"),
        )
    ).resolve()
    cache_home.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("DSP_CACHEDIR", str(cache_home / "dsp"))

    original_home = Path.home
    Path.home = classmethod(lambda cls: cache_home)  # type: ignore[method-assign]
    try:
        from knowledge_storm import STORMWikiRunner
    finally:
        Path.home = original_home  # type: ignore[method-assign]
    return STORMWikiRunner
