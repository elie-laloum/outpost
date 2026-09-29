import type { McpCliSupport } from "../mcp-support.types.ts";
import type { CliModelSupport } from "../settings.types.ts";
import { connectionPatterns } from "../unavailable.constants.ts";

export const copilotLabel = "GitHub Copilot CLI";

export const copilotCredentialVariables = Object.freeze({
  account: "COPILOT_GITHUB_TOKEN",
} as const);

export const copilotModelSupport: CliModelSupport = {
  agent: copilotLabel,
  reasoning: new Set(),
  maxOutputTokens: false,
};

export const copilotMcpSupport: McpCliSupport = Object.freeze({
  agent: copilotLabel,
  includeTools: true,
  excludeTools: true,
  startupTimeout: false,
  oauthLogin: false,
});

export const copilotQuotaPatterns = Object.freeze([
  /You['’]ve (?:hit|reached) (?:your |the )?(?:session |weekly )?rate limit/i,
  /run out of your included AI credits/i,
  /reached the spending limit/i,
  /wait for your limit to reset/i,
]);

export const copilotQuotaErrors = new Set(["quota", "rate_limit"]);

export const copilotUnavailablePatterns = Object.freeze([
  ...connectionPatterns,
  /\bserver error\b.*\b5\d\d\b/i,
]);
