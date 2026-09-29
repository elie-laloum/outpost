import { invariant } from "./errors.ts";
import {
  MCP_HEADER_PATTERN,
  MCP_HTTP_FIELDS,
  MCP_SERVER_NAME_PATTERN,
  MCP_STDIO_FIELDS,
  MCP_URL_PROTOCOLS,
  MCP_VARIABLE_PATTERN,
} from "./mcp-server.constants.ts";
import type {
  McpHttpServer,
  McpServer,
  McpServers,
  McpStdioServer,
} from "./mcp-server.types.ts";

export function mcpServers(value: unknown): McpServers {
  invariant(
    value !== null && typeof value === "object" && !Array.isArray(value),
    "mcpServers must be an object keyed by server name",
  );
  const servers = Object.entries(value).map(([name, server]) => {
    invariant(
      MCP_SERVER_NAME_PATTERN.test(name),
      `MCP server names use 1 to 32 letters, digits, underscores or hyphens: ${name}`,
    );
    invariant(
      server !== null && typeof server === "object" && !Array.isArray(server),
      `MCP server ${name} must be an object`,
    );
    invariant(
      "command" in server !== "url" in server,
      `MCP server ${name} requires either command or url`,
    );
    return [
      name,
      "command" in server
        ? stdioServer(name, server)
        : httpServer(name, server),
    ] as const;
  });
  return Object.freeze(Object.fromEntries(servers));
}

export function isMcpStdioServer(server: McpServer): server is McpStdioServer {
  return "command" in server;
}

export function mcpServerVariables(servers: McpServers): readonly string[] {
  return [
    ...new Set(
      Object.values(servers).flatMap((server) =>
        isMcpStdioServer(server)
          ? (server.variables ?? [])
          : server.bearerTokenVariable
            ? [server.bearerTokenVariable]
            : [],
      ),
    ),
  ];
}

function stdioServer(name: string, server: object): McpStdioServer {
  fields(name, server, MCP_STDIO_FIELDS);
  const value = server as McpStdioServer;
  invariant(
    typeof value.command === "string" && value.command.trim() !== "",
    `MCP server ${name} command must be nonempty text`,
  );
  literal(name, value.command);
  const argumentsList = value.arguments ?? [];
  invariant(
    Array.isArray(argumentsList) &&
      argumentsList.every((entry) => typeof entry === "string"),
    `MCP server ${name} arguments must be an array of strings`,
  );
  argumentsList.forEach((entry) => literal(name, entry));
  const environment = record(name, "environment", value.environment);
  for (const key of Object.keys(environment))
    invariant(
      MCP_VARIABLE_PATTERN.test(key),
      `MCP server ${name} has an invalid environment name: ${key}`,
    );
  const variables = variableNames(name, value.variables);
  invariant(
    variables.every((variable) => !(variable in environment)),
    `MCP server ${name} declares a variable and an environment value with the same name`,
  );
  return Object.freeze({
    command: value.command,
    ...(value.arguments
      ? { arguments: Object.freeze([...argumentsList]) }
      : {}),
    ...(value.environment ? { environment } : {}),
    ...(value.variables ? { variables: Object.freeze(variables) } : {}),
  });
}

function httpServer(name: string, server: object): McpHttpServer {
  fields(name, server, MCP_HTTP_FIELDS);
  const value = server as McpHttpServer;
  invariant(
    typeof value.url === "string" && URL.canParse(value.url),
    `MCP server ${name} url must be an absolute URL`,
  );
  literal(name, value.url);
  const url = new URL(value.url);
  invariant(
    MCP_URL_PROTOCOLS.has(url.protocol),
    `MCP server ${name} url must use http or https`,
  );
  invariant(
    url.username === "" && url.password === "",
    `MCP server ${name} url cannot embed credentials; use bearerTokenVariable`,
  );
  const headers = record(name, "headers", value.headers);
  for (const [key, header] of Object.entries(headers))
    invariant(
      MCP_HEADER_PATTERN.test(key) && !/[\r\n]/.test(header),
      `MCP server ${name} has an invalid header: ${key}`,
    );
  if (value.bearerTokenVariable !== undefined) {
    variableNames(name, [value.bearerTokenVariable]);
    invariant(
      Object.keys(headers).every(
        (key) => key.toLowerCase() !== "authorization",
      ),
      `MCP server ${name} sets both an Authorization header and bearerTokenVariable`,
    );
  }
  return Object.freeze({
    url: value.url,
    ...(value.headers ? { headers } : {}),
    ...(value.bearerTokenVariable
      ? { bearerTokenVariable: value.bearerTokenVariable }
      : {}),
  });
}

function fields(name: string, server: object, allowed: ReadonlySet<string>) {
  const unsupported = Object.keys(server).filter((key) => !allowed.has(key));
  invariant(
    unsupported.length === 0,
    `Unsupported MCP server ${name} option: ${unsupported.join(", ")}`,
  );
}

function record(
  name: string,
  label: string,
  value: unknown,
): Readonly<Record<string, string>> {
  if (value === undefined) return Object.freeze({});
  invariant(
    value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.values(value).every((entry) => typeof entry === "string"),
    `MCP server ${name} ${label} must map names to strings`,
  );
  Object.values(value).forEach((entry: string) => literal(name, entry));
  return Object.freeze({ ...(value as Record<string, string>) });
}

function variableNames(name: string, value: unknown): string[] {
  if (value === undefined) return [];
  invariant(
    Array.isArray(value) &&
      value.every(
        (entry) =>
          typeof entry === "string" && MCP_VARIABLE_PATTERN.test(entry),
      ),
    `MCP server ${name} variables must be environment variable names`,
  );
  return [...new Set<string>(value)];
}

// Each CLI expands ${NAME} differently, so literal values stay verbatim everywhere.
function literal(name: string, value: string): void {
  invariant(
    !value.includes("${") && !value.includes("\0"),
    `MCP server ${name} literal values cannot contain \${ or NUL; reference secrets with variables or bearerTokenVariable`,
  );
}
