import { isMcpStdioServer } from "../../domain/mcp-server.ts";
import type { McpServers } from "../../domain/mcp-server.types.ts";

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
  const configuration = Object.entries(servers ?? {}).flatMap(
    ([name, server]) => {
      const key = `mcp_servers.${name}`;
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
        ...(server.headers
          ? [`${key}.http_headers=${table(server.headers)}`]
          : []),
        ...(server.bearerTokenVariable
          ? [
              `${key}.bearer_token_env_var=${JSON.stringify(server.bearerTokenVariable)}`,
            ]
          : []),
      ];
    },
  );
  return configuration.flatMap((value) => ["-c", value]);
}
