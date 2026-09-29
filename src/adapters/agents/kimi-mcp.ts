import type { ConfigurationFile } from "../../domain/agent.types.ts";
import { isMcpStdioServer } from "../../domain/mcp-server.ts";
import type { McpServers } from "../../domain/mcp-server.types.ts";
import { mapServers } from "./mcp-configuration.ts";

// Kimi stdio servers inherit the CLI environment and expand no references.
export function kimiMcpFile(servers: McpServers): ConfigurationFile {
  return {
    path: ".kimi-code/mcp.json",
    section: "mcpServers",
    entries: mapServers(servers, (server) => ({
      ...(isMcpStdioServer(server)
        ? {
            command: server.command,
            args: server.arguments ?? [],
            env: { ...server.environment },
          }
        : {
            url: server.url,
            ...(server.headers ? { headers: server.headers } : {}),
            ...(server.bearerTokenVariable
              ? { bearerTokenEnvVar: server.bearerTokenVariable }
              : {}),
          }),
      ...(server.tools?.include ? { enabledTools: server.tools.include } : {}),
      ...(server.tools?.exclude ? { disabledTools: server.tools.exclude } : {}),
    })),
  };
}
