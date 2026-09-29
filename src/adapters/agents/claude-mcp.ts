import { isMcpStdioServer } from "../../domain/mcp-server.ts";
import type { McpServers } from "../../domain/mcp-server.types.ts";
import {
  bearerHeaders,
  excludedTools,
  mapServers,
  variableReferences,
} from "./mcp-configuration.ts";

// Inline forms keep the variadic --mcp-config and --disallowedTools from consuming later arguments.
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
  const excluded = excludedTools(servers).map(
    ([server, tool]) => `mcp__${server}__${tool}`,
  );
  return [
    `--mcp-config=${JSON.stringify({ mcpServers })}`,
    ...(excluded.length ? [`--disallowedTools=${excluded.join(",")}`] : []),
  ];
}
