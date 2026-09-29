import type { McpCliSupport } from "../mcp-support.types.ts";
import type { CliModelSupport } from "../settings.types.ts";
import { connectionPatterns } from "../unavailable.constants.ts";

export const claudeLabel = "Claude Code";

export const claudeCredentialVariables = Object.freeze({
  account: "CLAUDE_CODE_OAUTH_TOKEN",
  usage: "ANTHROPIC_API_KEY",
} as const);

export const claudeHostCredentials = Object.freeze({
  path: "~/.claude/.credentials.json",
  home: { variable: "CLAUDE_CONFIG_DIR", path: ".credentials.json" },
});

export const CLAUDE_MAX_OUTPUT_VARIABLE = "CLAUDE_CODE_MAX_OUTPUT_TOKENS";

export const CLAUDE_MCP_TIMEOUT_VARIABLE = "MCP_TIMEOUT";

export const claudeModelSupport: CliModelSupport = {
  agent: claudeLabel,
  reasoning: new Set(["low", "medium", "high", "xhigh", "max"]),
  maxOutputTokens: true,
};

export const claudeMcpSupport: McpCliSupport = Object.freeze({
  agent: claudeLabel,
  includeTools: false,
  excludeTools: true,
  startupTimeout: "shared",
  oauthLogin: true,
});

export const claudeQuotaPatterns = Object.freeze([
  /You['’]ve hit your (?:session |weekly |Opus |Sonnet |usage credit )?limit/i,
  /usage limit reached/i,
  /Request rejected \(429\)/i,
]);

export const claudeQuotaErrors = new Set(["rate_limit", "billing_error"]);

export const claudeUnavailablePatterns = Object.freeze([
  ...connectionPatterns,
  /\bAPI Error:? \(?(?:5\d\d)\b/i,
  /\bAPI Error:? \(?Connection error/i,
  /\boverloaded_error\b/,
]);

export const claudeDiagnosticUsage = {
  start: "Usage: claude [",
  resume: "Usage: claude [",
  fork: "Usage: claude [",
} as const;
