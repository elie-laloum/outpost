import { isMcpStdioServer } from "../../domain/mcp-server.ts";
import type { McpServers } from "../../domain/mcp-server.types.ts";
import {
  bearerHeaders,
  mapServers,
  variableReferences,
} from "./mcp-configuration.ts";

export function copilotMcpArguments(
  servers: McpServers | undefined,
): readonly string[] {
  if (!servers || Object.keys(servers).length === 0) return [];
  const mcpServers = mapServers(servers, (server) =>
    isMcpStdioServer(server)
      ? {
          type: "local",
          command: server.command,
          args: server.arguments ?? [],
          env: {
            ...server.environment,
            ...variableReferences(server.variables),
          },
          tools: ["*"],
        }
      : {
          type: "http",
          url: server.url,
          headers: bearerHeaders(server.headers, server.bearerTokenVariable),
          tools: ["*"],
        },
  );
  return ["--additional-mcp-config", JSON.stringify({ mcpServers })];
}
