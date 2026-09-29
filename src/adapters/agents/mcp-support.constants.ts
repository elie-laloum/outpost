import type { McpCliSupport } from "./mcp-support.types.ts";

export const mcpSupport = Object.freeze({
  claude: { agent: "Claude Code", includeTools: false, excludeTools: true },
  codex: { agent: "Codex", includeTools: true, excludeTools: true },
  copilot: {
    agent: "GitHub Copilot CLI",
    includeTools: true,
    excludeTools: true,
  },
  kimi: { agent: "Kimi Code", includeTools: true, excludeTools: true },
  antigravity: {
    agent: "Antigravity",
    includeTools: false,
    excludeTools: true,
  },
} satisfies Record<string, McpCliSupport>);
