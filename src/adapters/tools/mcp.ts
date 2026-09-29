import { invariant, OutpostError } from "../../domain/errors.ts";
import { isMcpStdioServer } from "../../domain/mcp-server.ts";
import type { McpServer, McpServers } from "../../domain/mcp-server.types.ts";
import type { SandboxLease } from "../../domain/sandbox.types.ts";
import type { Command } from "../../domain/command.types.ts";
import { mcpLauncher } from "./mcp-launcher.constants.ts";
import { openMcpProcess } from "./mcp-process.ts";
import { mcpTools } from "./mcp-tools.ts";
import {
  MCP_CLIENT_INFO,
  MCP_PROTOCOL_VERSION,
  mcpDefaults,
} from "./mcp.constants.ts";
import type { McpProcess, OpenedMcpServers } from "./mcp.types.ts";

export async function openMcpServers(
  servers: McpServers,
  lease: SandboxLease,
  signal: AbortSignal,
): Promise<OpenedMcpServers> {
  invariant(
    lease.liveInput === true,
    "MCP servers in the built-in harness need a sandbox lease with live process input",
  );
  const opened: McpProcess[] = [];
  const close = async () => {
    await Promise.allSettled(opened.map((session) => session.close()));
  };
  try {
    const tools = await Promise.all(
      Object.entries(servers).map(async ([name, server]) => {
        const session = openMcpProcess(
          name,
          lease,
          launch(name, server),
          signal,
        );
        opened.push(session);
        await initialize(name, session, signal);
        return mcpTools(name, session.connection, signal);
      }),
    );
    return { tools: tools.flat(), close };
  } catch (error) {
    await close();
    throw error;
  }
}

function launch(
  name: string,
  server: McpServer,
): Pick<Command, "executable" | "arguments" | "variables"> {
  const config = isMcpStdioServer(server)
    ? {
        server: name,
        command: server.command,
        arguments: server.arguments ?? [],
        variables: server.variables ?? [],
      }
    : {
        server: name,
        url: server.url,
        headers: server.headers ?? {},
        variables: server.bearerTokenVariable
          ? [server.bearerTokenVariable]
          : [],
        ...(server.bearerTokenVariable
          ? { bearerTokenVariable: server.bearerTokenVariable }
          : {}),
      };
  return {
    executable: "node",
    arguments: ["-e", mcpLauncher, JSON.stringify(config)],
    ...(isMcpStdioServer(server) && server.environment
      ? { variables: server.environment }
      : {}),
  };
}

async function initialize(
  name: string,
  session: McpProcess,
  signal: AbortSignal,
): Promise<void> {
  const timeout = AbortSignal.timeout(mcpDefaults.startupTimeoutMs);
  try {
    await session.connection.request(
      "initialize",
      {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: MCP_CLIENT_INFO,
      },
      AbortSignal.any([signal, timeout]),
    );
  } catch (error) {
    if (!timeout.aborted || signal.aborted) throw error;
    throw new OutpostError(
      "timeout",
      `MCP server ${name} did not initialize within ${mcpDefaults.startupTimeoutMs} ms`,
      { server: name },
    );
  }
  session.connection.notify("notifications/initialized");
}
