import type {
  AgentConfiguration,
  ConfigurationFile,
} from "../../domain/agent.types.ts";
import type { Variables } from "../../domain/command.types.ts";
import { invariant } from "../../domain/errors.ts";
import { mcpServerVariables } from "../../domain/mcp-server.ts";
import type { McpServers } from "../../domain/mcp-server.types.ts";

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
