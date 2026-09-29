import type { McpCliSupport } from "../mcp-support.types.ts";
import type { CliModelSupport } from "../settings.types.ts";
import { connectionPatterns } from "../unavailable.constants.ts";

export const antigravityLabel = "Antigravity";

export const antigravityVariables = Object.freeze({
  AGY_CLI_DISABLE_AUTO_UPDATE: "true",
});

export const antigravityCredentialVariables = Object.freeze({
  usage: "GEMINI_API_KEY",
} as const);

export const antigravitySettingsFile = '{"modelProvider":"gemini"}\n';

export const antigravityModelSupport: CliModelSupport = {
  agent: antigravityLabel,
  reasoning: new Set(),
  maxOutputTokens: false,
};

export const antigravityMcpSupport: McpCliSupport = Object.freeze({
  agent: antigravityLabel,
  includeTools: false,
  excludeTools: true,
  startupTimeout: false,
  oauthLogin: false,
});

export const antigravityQuotaPatterns = Object.freeze([
  /exhausted your quota/i,
  /RESOURCE_EXHAUSTED/,
]);

export const antigravityUnavailablePatterns = Object.freeze([
  ...connectionPatterns,
  /\bUNAVAILABLE\b/,
  /\bmodel is overloaded\b/i,
]);
