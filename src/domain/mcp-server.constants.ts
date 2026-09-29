export const MCP_SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

export const MCP_VARIABLE_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const MCP_HEADER_PATTERN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

export const MCP_STDIO_FIELDS: ReadonlySet<string> = new Set([
  "command",
  "arguments",
  "environment",
  "variables",
  "tools",
  "startupTimeoutMs",
]);

export const MCP_HTTP_FIELDS: ReadonlySet<string> = new Set([
  "url",
  "headers",
  "bearerTokenVariable",
  "oauth",
  "tools",
  "startupTimeoutMs",
]);

export const MCP_TOOL_FILTER_FIELDS: ReadonlySet<string> = new Set([
  "include",
  "exclude",
]);

// Kimi stores timeouts as 32-bit integers and Node timers overflow above this bound.
export const MCP_MAX_TIMEOUT_MS = 2_147_483_647;

export const MCP_TOOL_NAME_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

export const MCP_URL_PROTOCOLS: ReadonlySet<string> = new Set([
  "http:",
  "https:",
]);
