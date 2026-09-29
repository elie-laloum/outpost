import { isMcpStdioServer } from "../../domain/mcp-server.ts";
import type { McpServers } from "../../domain/mcp-server.types.ts";
import {
  bearerHeaders,
  mapServers,
  variableReferences,
} from "./mcp-configuration.ts";

// The inline form keeps the variadic --mcp-config from consuming later arguments.
export function claudeMcpArguments(
  servers: McpServers | undefined,
): readonly string[] {
  if (!servers || Object.keys(servers).length === 0) return [];
  const mcpServers = mapServers(servers, (server) =>
    isMcpStdioServer(server)
      ? {
          type: "stdio",
          command: server.command,
          args: server.arguments ?? [],
          env: {
            ...server.environment,
            ...variableReferences(server.variables),
          },
        }
      : {
          type: "http",
          url: server.url,
          headers: bearerHeaders(server.headers, server.bearerTokenVariable),
        },
  );
  return [`--mcp-config=${JSON.stringify({ mcpServers })}`];
}
