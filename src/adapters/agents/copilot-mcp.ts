import { isMcpStdioServer } from "../../domain/mcp-server.ts";
import type { McpServers } from "../../domain/mcp-server.types.ts";
import {
  bearerHeaders,
  excludedTools,
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
          tools: server.tools?.include ?? ["*"],
        }
      : {
          type: "http",
          url: server.url,
          headers: bearerHeaders(server.headers, server.bearerTokenVariable),
          tools: server.tools?.include ?? ["*"],
        },
  );
  // Copilot documents server(tool) patterns for permissions; a denied tool stays listed.
  return [
    "--additional-mcp-config",
    JSON.stringify({ mcpServers }),
    ...excludedTools(servers).map(
      ([server, tool]) => `--deny-tool=${server}(${tool})`,
    ),
  ];
}
