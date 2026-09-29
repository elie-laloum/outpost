import type { ConfigurationFile } from "../../../domain/agent.types.ts";
import { createHash } from "node:crypto";
import type { HostConfiguration } from "../../../domain/agent.types.ts";
import {
  isMcpStdioServer,
  mcpLoginServers,
} from "../../../domain/mcp-server.ts";
import { KIMI_MCP_OAUTH_FILES, kimiLabel } from "./kimi.constants.ts";
import { asRecord, parseCredential } from "../protocol.ts";
import type { McpServers } from "../../../domain/mcp-server.types.ts";
import { mapServers } from "../mcp-configuration.ts";

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
            ...(server.oauth ? { auth: "oauth" } : {}),
          }),
      ...(server.tools?.include ? { enabledTools: server.tools.include } : {}),
      ...(server.tools?.exclude ? { disabledTools: server.tools.exclude } : {}),
      ...(server.startupTimeoutMs === undefined
        ? {}
        : { startupTimeoutMs: server.startupTimeoutMs }),
    })),
  };
}

// Mirrors Kimi's mcpOAuthStoreKey: sanitized name plus a hash of name and canonical URL.
export function kimiMcpStoreKey(name: string, url: string): string {
  const safe = name.replaceAll(/[^a-zA-Z0-9_-]/g, "_").replaceAll(/_+/g, "_");
  const resource = new URL(url);
  resource.hash = "";
  const digest = createHash("sha256")
    .update(name)
    .update("\0")
    .update(resource.toString())
    .digest("hex")
    .slice(0, 24);
  return `${safe}-${digest}`;
}

export function kimiMcpLogins(
  servers: McpServers,
): readonly HostConfiguration[] {
  return mcpLoginServers(servers).flatMap(([name, server]) => {
    const key = kimiMcpStoreKey(name, server.url);
    return KIMI_MCP_OAUTH_FILES.map(({ suffix, required }) => {
      const file = `${key}${suffix}`;
      return {
        source: {
          path: `~/.kimi-code/credentials/mcp/${file}`,
          home: { variable: "KIMI_CODE_HOME", path: `credentials/mcp/${file}` },
        },
        path: `.kimi-code/credentials/mcp/${file}`,
        ...(required ? {} : { optional: true }),
        login: `kimi and authenticate MCP server ${name} with the same URL`,
        select: (content: string) =>
          asRecord(parseCredential(content, kimiLabel)),
      };
    });
  });
}
