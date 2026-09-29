import type { HostConfiguration } from "../../../domain/agent.types.ts";
import {
  isMcpStdioServer,
  mcpLoginServers,
} from "../../../domain/mcp-server.ts";
import { codexLabel, codexMcpHostCredentials } from "./codex.constants.ts";
import { loginEntries } from "../mcp-configuration.ts";
import { asRecord, parseCredential } from "../protocol.ts";
import type {
  McpServer,
  McpServers,
} from "../../../domain/mcp-server.types.ts";

// JSON strings and string arrays are valid TOML values; tables use quoted keys.
function table(value: Readonly<Record<string, string>>): string {
  const entries = Object.entries(value).map(
    ([key, entry]) => `${JSON.stringify(key)}=${JSON.stringify(entry)}`,
  );
  return `{${entries.join(",")}}`;
}

export function codexMcpArguments(
  servers: McpServers | undefined,
): readonly string[] {
  return [
    ...(mcpLoginServers(servers).length
      ? ['mcp_oauth_credentials_store="file"']
      : []),
    ...Object.entries(servers ?? {}).flatMap(([name, server]) => {
      const key = `mcp_servers.${name}`;
      return [...transport(key, server), ...options(key, server)];
    }),
  ].flatMap((value) => ["-c", value]);
}

// Codex keys stored logins by server name and URL only, so entries keep their host keys.
export function codexMcpLogins(
  servers: McpServers,
): readonly HostConfiguration[] {
  const logins = mcpLoginServers(servers);
  if (!logins.length) return [];
  return [
    {
      source: codexMcpHostCredentials,
      path: ".codex/.credentials.json",
      login: 'codex mcp login with mcp_oauth_credentials_store = "file"',
      select: (content) =>
        loginEntries(
          codexLabel,
          asRecord(parseCredential(content, codexLabel)),
          logins,
          (entry, name, url) =>
            entry.server_name === name &&
            entry.server_url === url &&
            entry.executor_owned !== true,
          (name) =>
            `codex mcp login ${name} with mcp_oauth_credentials_store = "file"`,
        ),
    },
  ];
}

function transport(key: string, server: McpServer): readonly string[] {
  if (isMcpStdioServer(server))
    return [
      `${key}.command=${JSON.stringify(server.command)}`,
      `${key}.args=${JSON.stringify(server.arguments ?? [])}`,
      ...(server.environment
        ? [`${key}.env=${table(server.environment)}`]
        : []),
      ...(server.variables
        ? [`${key}.env_vars=${JSON.stringify(server.variables)}`]
        : []),
    ];
  return [
    `${key}.url=${JSON.stringify(server.url)}`,
    ...(server.headers ? [`${key}.http_headers=${table(server.headers)}`] : []),
    ...(server.bearerTokenVariable
      ? [
          `${key}.bearer_token_env_var=${JSON.stringify(server.bearerTokenVariable)}`,
        ]
      : []),
  ];
}

function options(key: string, server: McpServer): readonly string[] {
  return [
    ...(server.tools?.include
      ? [`${key}.enabled_tools=${JSON.stringify(server.tools.include)}`]
      : []),
    ...(server.tools?.exclude
      ? [`${key}.disabled_tools=${JSON.stringify(server.tools.exclude)}`]
      : []),
    ...(server.startupTimeoutMs === undefined
      ? []
      : [`${key}.startup_timeout_ms=${server.startupTimeoutMs}`]),
  ];
}
