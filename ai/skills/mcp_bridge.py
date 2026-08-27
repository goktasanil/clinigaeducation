from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


@dataclass
class MCPServer:
    command: str
    args: list[str]


async def list_tools(server: MCPServer) -> list[dict[str, Any]]:
    params = StdioServerParameters(command=server.command, args=server.args)
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            return [tool.model_dump() for tool in tools.tools]


async def call_tool(server: MCPServer, tool_name: str, arguments: dict[str, Any]):
    params = StdioServerParameters(command=server.command, args=server.args)
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            return await session.call_tool(tool_name, arguments)
