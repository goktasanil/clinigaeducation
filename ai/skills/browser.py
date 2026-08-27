from __future__ import annotations

from browser_use import Agent

from .registry import Skill, registry


async def research(task: str, llm):
    agent = Agent(task=task, llm=llm)
    return await agent.run()


registry.register(Skill(
    name="browser.research",
    description="Use a browser agent to research and interact with websites.",
    handler=research,
))
