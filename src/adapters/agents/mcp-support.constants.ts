import type { McpCliSupport } from "./mcp-support.types.ts";

export const CLAUDE_MCP_TIMEOUT_VARIABLE = "MCP_TIMEOUT";

export const mcpSupport = Object.freeze({
  claude: {
    agent: "Claude Code",
    includeTools: false,
    excludeTools: true,
    startupTimeout: "shared",
  },
  codex: {
    agent: "Codex",
    includeTools: true,
    excludeTools: true,
    startupTimeout: "server",
  },
  copilot: {
    agent: "GitHub Copilot CLI",
    includeTools: true,
    excludeTools: true,
    startupTimeout: false,
  },
  kimi: {
    agent: "Kimi Code",
    includeTools: true,
    excludeTools: true,
    startupTimeout: "server",
  },
  antigravity: {
    agent: "Antigravity",
    includeTools: false,
    excludeTools: true,
    startupTimeout: false,
  },
} satisfies Record<string, McpCliSupport>);
