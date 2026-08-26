from dataclasses import dataclass


@dataclass(frozen=True)
class Route:
    model: str
    reason: str


class ModelRouter:
    def __init__(self, default_model: str = "local-general", reasoning_model: str = "local-reasoning", code_model: str = "local-code"):
        self.default_model = default_model
        self.reasoning_model = reasoning_model
        self.code_model = code_model

    def choose(self, task: str) -> Route:
        text = task.lower()
        if any(k in text for k in ["code", "python", "typescript", "bug", "repo", "kod", "hata"]):
            return Route(self.code_model, "coding task")
        if any(k in text for k in ["analyze", "compare", "reason", "plan", "analiz", "karşılaştır", "strateji"]):
            return Route(self.reasoning_model, "reasoning-heavy task")
        return Route(self.default_model, "general task")
