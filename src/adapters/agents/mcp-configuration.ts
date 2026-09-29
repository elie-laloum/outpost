import type {
  AgentConfiguration,
  ConfigurationFile,
} from "../../domain/agent.types.ts";
import type { Variables } from "../../domain/command.types.ts";
import { invariant } from "../../domain/errors.ts";
import { mcpServerVariables } from "../../domain/mcp-server.ts";
import type { McpServers } from "../../domain/mcp-server.types.ts";
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
  }
}

export function mcpConfigurationPlanner(
  agent: string,
  servers: McpServers | undefined,
  file?: (servers: McpServers) => ConfigurationFile,
): ((variables: Variables) => AgentConfiguration) | undefined {
  if (!servers || Object.keys(servers).length === 0) return undefined;
  const required = mcpServerVariables(servers);
  const files = Object.freeze(file ? [file(servers)] : []);
  return (variables) => {
    for (const name of required)
      invariant(
        variables[name],
        `Missing ${name} for ${agent} MCP servers. Declare it in the harness variables or .outpost/.env.`,
      );
    return { files };
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
