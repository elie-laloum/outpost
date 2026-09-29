import type { McpCliSupport } from "../mcp-support.types.ts";
import type { CliModelSupport } from "../settings.types.ts";
import { connectionPatterns } from "../unavailable.constants.ts";

export const kimiLabel = "Kimi Code";

export const kimiCredentialVariables = Object.freeze({
  usage: "KIMI_API_KEY",
} as const);

export const KIMI_LOGIN_DEADLINE_MS = 120_000;

export const kimiModelSupport: CliModelSupport = {
  agent: kimiLabel,
  reasoning: new Set(),
  maxOutputTokens: false,
};

export const kimiMcpSupport: McpCliSupport = Object.freeze({
  agent: kimiLabel,
  includeTools: true,
  excludeTools: true,
  startupTimeout: "server",
  oauthLogin: true,
});

export const kimiQuotaPatterns = Object.freeze([
  /exceeded_current_quota_error/i,
  /insufficient_quota/i,
  /exceeded your current (?:token )?quota/i,
  /check your account balance|insufficient balance/i,
  /provider\.rate_limit/i,
]);

export const kimiUnavailablePatterns = Object.freeze([
  ...connectionPatterns,
  /\bError code: 5\d\d\b/,
  /\bAPI(?:Connection|Timeout)Error\b/,
  /\bengine_overloaded_error\b/,
]);

export const DEFAULT_KIMI_REGION = "global";

export const kimiRegions = Object.freeze({
  "mainland-cn": {
    credential: "kimi-code.json",
    oauthHost: "https://auth.kimi.com",
    baseUrl: "https://api.kimi.com/coding/v1",
  },
  global: {
    credential: "kimi-code-env-0e4f99c69cc27850.json",
    oauthHost: "https://auth.kimi.ai",
    baseUrl: "https://api.kimi.ai/coding/v1",
  },
} as const);

export const KIMI_MCP_OAUTH_FILES = Object.freeze([
  { suffix: "-tokens.json", required: true },
  { suffix: "-client.json", required: false },
  { suffix: "-discovery.json", required: false },
  { suffix: "-meta.json", required: false },
]);
