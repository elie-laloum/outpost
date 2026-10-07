export const modelPriceEndpoints = {
  "models.dev": "https://models.dev/api.json?type=all",
  openrouter: "https://openrouter.ai/api/v1/models",
} as const;
export const modelPriceDefaults = {
  source: "models.dev",
  currency: "USD",
  timeoutMs: 15_000,
  maxResponseBytes: 32 * 1024 * 1024,
} as const;
