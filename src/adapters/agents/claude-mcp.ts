import type { HostConfiguration } from "../../domain/agent.types.ts";
import { isMcpStdioServer, mcpLoginServers } from "../../domain/mcp-server.ts";
import { hostCredentialSources } from "./authentication.constants.ts";
import { asRecord, parseCredential } from "./protocol.ts";
import type { McpServers } from "../../domain/mcp-server.types.ts";
import {
  bearerHeaders,
  excludedTools,
  loginEntries,
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

export function claudeMcpLogins(
  servers: McpServers,
): readonly HostConfiguration[] {
  const logins = mcpLoginServers(servers);
  if (!logins.length) return [];
  return [
    {
      source: hostCredentialSources.claude,
      path: ".claude/.credentials.json",
      section: "mcpOAuth",
      login: "claude mcp login",
      select: (content) =>
        loginEntries(
          "Claude Code",
          asRecord(asRecord(parseCredential(content, "Claude")).mcpOAuth),
          logins,
          (entry, name, url) =>
            entry.serverName === name && entry.serverUrl === url,
          (name) => `claude mcp login ${name}`,
        ),
    },
  ];
}
