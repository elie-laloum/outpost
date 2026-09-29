import type { McpCliSupport } from "./mcp-support.types.ts";

export const CLAUDE_MCP_TIMEOUT_VARIABLE = "MCP_TIMEOUT";

export const mcpSupport = Object.freeze({
  claude: {
    agent: "Claude Code",
    includeTools: false,
    excludeTools: true,
    startupTimeout: "shared",
    oauthLogin: true,
  },
  codex: {
    agent: "Codex",
    includeTools: true,
    excludeTools: true,
    startupTimeout: "server",
    oauthLogin: true,
  },
  copilot: {
    agent: "GitHub Copilot CLI",
    includeTools: true,
    excludeTools: true,
    startupTimeout: false,
    oauthLogin: false,
  },
  kimi: {
    agent: "Kimi Code",
    includeTools: true,
    excludeTools: true,
    startupTimeout: "server",
    oauthLogin: true,
  },
  antigravity: {
    agent: "Antigravity",
    includeTools: false,
    excludeTools: true,
    startupTimeout: false,
    oauthLogin: false,
  },
} satisfies Record<string, McpCliSupport>);
