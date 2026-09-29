import type { McpCliSupport } from "../mcp-support.types.ts";
import type { CliModelSupport } from "../settings.types.ts";
import { connectionPatterns } from "../unavailable.constants.ts";

export const codexLabel = "Codex";

export const codexCredentialVariables = Object.freeze({
  usage: "OPENAI_API_KEY",
} as const);

export const codexMcpHostCredentials = Object.freeze({
  path: "~/.codex/.credentials.json",
  home: { variable: "CODEX_HOME", path: ".credentials.json" },
});

export const codexModelSupport: CliModelSupport = {
  agent: codexLabel,
  reasoning: new Set(["low", "medium", "high", "xhigh", "max"]),
  maxOutputTokens: false,
};

export const codexMcpSupport: McpCliSupport = Object.freeze({
  agent: codexLabel,
  includeTools: true,
  excludeTools: true,
  startupTimeout: "server",
  oauthLogin: true,
});

export const codexQuotaPatterns = Object.freeze([
  /You['’]ve hit your usage limit/i,
  /Usage limit reached/i,
  /Quota exceeded/i,
  /exceeded retry limit, last status: 429/i,
]);

export const codexUnavailablePatterns = Object.freeze([
  ...connectionPatterns,
  /exceeded retry limit, last status: 5\d\d/i,
  /\bstream disconnected before completion\b/i,
]);

export const codexDiagnosticUsage = {
  start: "Usage: codex exec [",
  resume: "Usage: codex exec resume [",
  fork: "Usage: codex exec fork [",
} as const;
