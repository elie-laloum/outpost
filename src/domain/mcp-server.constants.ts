export const MCP_SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

export const MCP_VARIABLE_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const MCP_HEADER_PATTERN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

export const MCP_STDIO_FIELDS: ReadonlySet<string> = new Set([
  "command",
  "arguments",
  "environment",
  "variables",
]);

export const MCP_HTTP_FIELDS: ReadonlySet<string> = new Set([
  "url",
  "headers",
  "bearerTokenVariable",
]);

export const MCP_URL_PROTOCOLS: ReadonlySet<string> = new Set([
  "http:",
  "https:",
]);
