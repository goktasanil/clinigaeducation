from __future__ import annotations

import os


class OptionalModule:
    def __init__(self, import_name: str, env_flag: str):
        self.import_name = import_name
        self.env_flag = env_flag

    @property
    def enabled(self) -> bool:
        if os.getenv(self.env_flag, "false").lower() != "true":
            return False
        try:
            __import__(self.import_name)
            return True
        except Exception:
            return False


haystack = OptionalModule("haystack", "CLINIGA_ENABLE_HAYSTACK")
dspy = OptionalModule("dspy", "CLINIGA_ENABLE_DSPY")
pydantic_ai = OptionalModule("pydantic_ai", "CLINIGA_ENABLE_PYDANTIC_AI")
temporal = OptionalModule("temporalio", "CLINIGA_ENABLE_TEMPORAL")
dagster = OptionalModule("dagster", "CLINIGA_ENABLE_DAGSTER")
openai_agents = OptionalModule("agents", "CLINIGA_ENABLE_OPENAI_AGENTS")
inspect_ai = OptionalModule("inspect_ai", "CLINIGA_ENABLE_INSPECT_AI")


class HeliconeConfig:
    def __init__(self) -> None:
        self.base_url = os.getenv("CLINIGA_HELICONE_URL", "").strip()
        self.api_key_env = os.getenv("CLINIGA_HELICONE_API_KEY_ENV", "HELICONE_API_KEY").strip()

    @property
    def enabled(self) -> bool:
        return bool(self.base_url and os.getenv(self.api_key_env, ""))


helicone = HeliconeConfig()
