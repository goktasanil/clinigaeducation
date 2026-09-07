from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UpstreamCapability:
    repo: str
    capability: str
    mode: str = "opt-in-adapter"


FABLE_TARGETING_UPSTREAMS = [
    UpstreamCapability("alainbrown/openfable", "hierarchy-aware retrieval and budget-aware long-context navigation"),
    UpstreamCapability("SWE-agent/SWE-agent", "repository-scale issue localization and repair loops"),
    UpstreamCapability("OpenHands/OpenHands", "long-horizon software-agent execution and workspace interaction"),
    UpstreamCapability("Aider-AI/aider", "repo-map driven code editing and minimal patch workflows"),
]


def repositories() -> list[str]:
    return [item.repo for item in FABLE_TARGETING_UPSTREAMS]
