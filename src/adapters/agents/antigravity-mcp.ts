import type { ConfigurationFile } from "../../domain/agent.types.ts";
import { isMcpStdioServer } from "../../domain/mcp-server.ts";
import type { McpServers } from "../../domain/mcp-server.types.ts";
import {
  bearerHeaders,
  mapServers,
  variableReferences,
} from "./mcp-configuration.ts";

export function antigravityMcpFile(servers: McpServers): ConfigurationFile {
  return {
    path: ".gemini/config/mcp_config.json",
    section: "mcpServers",
    entries: mapServers(servers, (server) =>
      isMcpStdioServer(server)
        ? {
            command: server.command,
            args: server.arguments ?? [],
            env: {
              ...server.environment,
              ...variableReferences(server.variables),
            },
            disabled: false,
          }
        : {
            serverUrl: server.url,
            headers: bearerHeaders(server.headers, server.bearerTokenVariable),
            disabled: false,
          },
    ),
  };
}
