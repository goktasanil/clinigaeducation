from __future__ import annotations

import os
import re
from urllib.parse import urlparse

from browser_use import Agent

from .registry import Skill, registry

_URL_RE = re.compile(r"https?://[^\s<>\]\[(){}]+", re.I)
_MUTATING_PATTERNS = re.compile(
    r"\b(submit|upload|delete|remove|purchase|buy|checkout|login|log in|sign in|"
    r"send message|send email|post comment|publish|follow|like|register|create account|"
    r"gönder|yükle|sil|satın al|giriş yap|kayıt ol|yorum yaz|yayınla)\b",
    re.I,
)


def _allowed_hosts() -> set[str]:
    return {
        host.strip().lower()
        for host in os.getenv("CLINIGA_BROWSER_ALLOWED_HOSTS", "").split(",")
        if host.strip()
    }


def _validate_read_only_task(task: str) -> str:
    value = str(task or "").strip()
    if not value or len(value) > 10_000:
        raise ValueError("browser research task must be between 1 and 10000 characters")
    if _MUTATING_PATTERNS.search(value):
        raise PermissionError("browser.research is read-only; mutating browser actions require a separately approved write tool")

    urls = _URL_RE.findall(value)
    if not urls:
        raise ValueError("browser.research requires at least one explicit http(s) URL")
    allowed = _allowed_hosts()
    if not allowed:
        raise PermissionError("CLINIGA_BROWSER_ALLOWED_HOSTS must explicitly allow browser research targets")
    for raw in urls:
        parsed = urlparse(raw.rstrip(".,;:"))
        host = (parsed.hostname or "").lower()
        if parsed.scheme not in {"http", "https"} or not host:
            raise ValueError("invalid browser research URL")
        if parsed.username or parsed.password:
            raise PermissionError("browser research URLs may not embed credentials")
        if host not in allowed and not any(host.endswith(f".{parent}") for parent in allowed):
            raise PermissionError(f"browser research host is not allowed: {host}")
    return value


async def research(task: str, llm):
    validated = _validate_read_only_task(task)
    constrained_task = (
        "READ-ONLY RESEARCH ONLY. Do not log in, submit forms, upload files, send messages, "
        "purchase anything, create or modify accounts, publish, comment, delete, or perform any "
        "state-changing action. Navigate only as needed to read public information from the "
        f"explicitly allowlisted URLs in this task.\n\nTask: {validated}"
    )
    agent = Agent(task=constrained_task, llm=llm)
    return await agent.run()


registry.register(
    Skill(
        name="browser.research",
        description="Read-only browser research on explicit administrator-allowlisted URLs.",
        handler=research,
    )
)
