export const MODEL_TIMEOUT_MS = 120_000;
export const MODEL_RESPONSE_BYTES = 8 * 1024 * 1024;
export const MODEL_MAX_TIMEOUT_MS = 2_147_483_647;
export const MODEL_REQUEST_FIELDS = new Set([
  "prompt",
  "system",
  "maxOutputTokens",
  "signal",
]);
