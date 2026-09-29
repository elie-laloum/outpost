import { invariant, OutpostError } from "../../domain/errors.ts";
import { httpVariables, isMcpStdioServer } from "../../domain/mcp-server.ts";
import type { McpServer, McpServers } from "../../domain/mcp-server.types.ts";
import type { SandboxLease } from "../../domain/sandbox.types.ts";
import type { Command } from "../../domain/command.types.ts";
import { mcpLauncher } from "./mcp-launcher.constants.ts";
import { openMcpProcess } from "./mcp-process.ts";
import { mcpTools } from "./mcp-tools.ts";
import {
  MCP_CLIENT_CREDENTIALS_EXTENSION,
  MCP_CLIENT_INFO,
  MCP_PROTOCOL_VERSION,
  mcpDefaults,
} from "./mcp.constants.ts";
import { mcpRecord } from "./mcp-content.ts";
import { getMcpPrompt, mcpCapabilityTools } from "./mcp-resources.ts";
import type { McpProcess, McpSession, OpenedMcpServers } from "./mcp.types.ts";

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
  const sessions: McpSession[] = [];
  const close = async () => {
    await Promise.allSettled(opened.map((session) => session.close()));
  };
  try {
    const tools = await Promise.all(
      Object.entries(servers).map(async ([name, server], index) => {
        const session = openMcpProcess(
          name,
          lease,
          launch(name, server),
          signal,
        );
        opened.push(session);
        const capabilities = await initialize(
          name,
          session,
          clientCapabilities(server),
          server.startupTimeoutMs ?? mcpDefaults.startupTimeoutMs,
          signal,
        );
        sessions[index] = {
          name,
          connection: session.connection,
          capabilities,
        };
        return mcpTools(name, session.connection, signal, server.tools);
      }),
    );
    return {
      tools: [...tools.flat(), ...mcpCapabilityTools(sessions)],
      prompt: (server, name, promptArguments, promptSignal) =>
        getMcpPrompt(sessions, server, name, promptArguments, promptSignal),
      close,
    };
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
        variables: httpVariables(server),
        ...(server.bearerTokenVariable
          ? { bearerTokenVariable: server.bearerTokenVariable }
          : {}),
        ...(typeof server.oauth === "object" ? { oauth: server.oauth } : {}),
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
  capabilities: Readonly<Record<string, unknown>>,
  timeoutMs: number,
  signal: AbortSignal,
): Promise<Readonly<Record<string, unknown>>> {
  const timeout = AbortSignal.timeout(timeoutMs);
  let result: unknown;
  try {
    result = await session.connection.request(
      "initialize",
      {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities,
        clientInfo: MCP_CLIENT_INFO,
      },
      AbortSignal.any([signal, timeout]),
    );
  } catch (error) {
    if (!timeout.aborted || signal.aborted) throw error;
    throw new OutpostError(
      "timeout",
      `MCP server ${name} did not initialize within ${timeoutMs} ms`,
      { server: name },
    );
  }
  session.connection.notify("notifications/initialized");
  return mcpRecord(mcpRecord(result)?.capabilities) ?? {};
}

function clientCapabilities(
  server: McpServer,
): Readonly<Record<string, unknown>> {
  return !isMcpStdioServer(server) && typeof server.oauth === "object"
    ? { extensions: { [MCP_CLIENT_CREDENTIALS_EXTENSION]: {} } }
    : {};
}
