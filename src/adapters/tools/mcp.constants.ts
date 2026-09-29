export const MCP_PROTOCOL_VERSION = "2025-06-18";

export const MCP_CLIENT_CREDENTIALS_EXTENSION =
  "io.modelcontextprotocol/oauth-client-credentials";

export const MCP_CLIENT_INFO = Object.freeze({
  name: "outpost",
  version: "1",
});

export const mcpDefaults = Object.freeze({
  startupTimeoutMs: 60_000,
  closeGraceMs: 2_000,
  stderrCharacters: 4_096,
  lineCharacters: 16 * 1024 * 1024,
  // setTimeout overflows above 2^31 - 1; the turn signal bounds the process instead.
  processDeadlineMs: 2_147_483_647,
  missingVariableStatus: 78,
});

export const MCP_TOOL_PREFIX = "mcp__";

export const MCP_METHOD_NOT_FOUND = -32601;

export const MCP_CAPABILITY_TOOLS = Object.freeze({
  listResources: "mcp_list_resources",
  readResource: "mcp_read_resource",
  listPrompts: "mcp_list_prompts",
  getPrompt: "mcp_get_prompt",
});
