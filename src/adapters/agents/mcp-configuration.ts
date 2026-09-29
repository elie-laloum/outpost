import type {
  AgentConfiguration,
  ConfigurationFile,
  HostConfiguration,
} from "../../domain/agent.types.ts";
import type { Variables } from "../../domain/command.types.ts";
import { invariant } from "../../domain/errors.ts";
import { mcpServerVariables } from "../../domain/mcp-server.ts";
import type {
  McpHttpServer,
  McpServers,
} from "../../domain/mcp-server.types.ts";
import { asRecord } from "./protocol.ts";
import type { McpCliSupport } from "./mcp-support.types.ts";

export function supportMcpServers(
  support: McpCliSupport,
  servers: McpServers | undefined,
): void {
  for (const [name, server] of Object.entries(servers ?? {})) {
    invariant(
      server.tools?.include === undefined || support.includeTools,
      `${support.agent} cannot restrict MCP server ${name} to listed tools; use tools.exclude instead`,
    );
    invariant(
      server.tools?.exclude === undefined || support.excludeTools,
      `${support.agent} cannot exclude tools of MCP server ${name}`,
    );
    invariant(
      !("oauth" in server) || typeof server.oauth !== "object",
      `${support.agent} cannot use OAuth client credentials for MCP server ${name}; they are supported by the built-in harness`,
    );
    invariant(
      support.oauthLogin || !("oauth" in server),
      `${support.agent} cannot reuse a host OAuth login for MCP server ${name}; use bearerTokenVariable`,
    );
    invariant(
      server.startupTimeoutMs === undefined || support.startupTimeout,
      `${support.agent} has no MCP startup timeout; remove startupTimeoutMs from MCP server ${name}`,
    );
  }
  const timeouts = new Set(
    Object.values(servers ?? {}).flatMap((server) =>
      server.startupTimeoutMs === undefined ? [] : [server.startupTimeoutMs],
    ),
  );
  invariant(
    support.startupTimeout !== "shared" || timeouts.size <= 1,
    `${support.agent} applies one MCP startup timeout to every server; declare the same startupTimeoutMs on each server`,
  );
}

export function sharedStartupTimeout(
  servers: McpServers | undefined,
): number | undefined {
  return Object.values(servers ?? {}).find(
    (server) => server.startupTimeoutMs !== undefined,
  )?.startupTimeoutMs;
}

export function mcpConfigurationPlanner(
  agent: string,
  servers: McpServers | undefined,
  file?: (servers: McpServers) => ConfigurationFile,
  logins?: (servers: McpServers) => readonly HostConfiguration[],
): ((variables: Variables) => AgentConfiguration) | undefined {
  if (!servers || Object.keys(servers).length === 0) return undefined;
  const required = mcpServerVariables(servers);
  const files = Object.freeze(file ? [file(servers)] : []);
  const host = Object.freeze(logins?.(servers) ?? []);
  return (variables) => {
    for (const name of required)
      invariant(
        variables[name],
        `Missing ${name} for ${agent} MCP servers. Declare it in the harness variables or .outpost/.env.`,
      );
    return host.length ? { files, host } : { files };
  };
}

export function variableReferences(
  names: readonly string[] | undefined,
): Readonly<Record<string, string>> {
  return Object.fromEntries((names ?? []).map((name) => [name, `\${${name}}`]));
}

export function bearerHeaders(
  headers: Readonly<Record<string, string>> | undefined,
  variable: string | undefined,
): Readonly<Record<string, string>> {
  return {
    ...headers,
    ...(variable ? { Authorization: `Bearer \${${variable}}` } : {}),
  };
}

export function excludedTools(
  servers: McpServers | undefined,
): readonly (readonly [server: string, tool: string])[] {
  return Object.entries(servers ?? {}).flatMap(([name, server]) =>
    (server.tools?.exclude ?? []).map((tool) => [name, tool] as const),
  );
}

export function loginEntries(
  agent: string,
  stored: Readonly<Record<string, unknown>>,
  logins: readonly (readonly [name: string, server: McpHttpServer])[],
  matches: (
    entry: Record<string, unknown>,
    name: string,
    url: string,
  ) => boolean,
  login: (name: string) => string,
): Readonly<Record<string, unknown>> {
  const selected: Record<string, unknown> = {};
  for (const [name, server] of logins) {
    const found = Object.entries(stored).filter(([, entry]) =>
      matches(asRecord(entry), name, server.url),
    );
    invariant(
      found.length > 0,
      `No ${agent} MCP OAuth login for server ${name} at ${server.url}. Run ${login(name)} on the host with the same server name and URL.`,
    );
    Object.assign(selected, Object.fromEntries(found));
  }
  return selected;
}

export function mapServers(
  servers: McpServers | undefined,
  render: (server: McpServers[string]) => Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  return Object.fromEntries(
    Object.entries(servers ?? {}).map(([name, server]) => [
      name,
      render(server),
    ]),
  );
}
