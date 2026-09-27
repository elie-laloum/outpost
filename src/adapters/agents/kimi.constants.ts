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
