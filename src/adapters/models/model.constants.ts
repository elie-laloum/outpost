export const MODEL_TIMEOUT_MS = 120_000;
export const MODEL_RESPONSE_BYTES = 8 * 1024 * 1024;
export const MODEL_ERROR_BYTES = 64 * 1024;
export const MODEL_MAX_TIMEOUT_MS = 2_147_483_647;
export const MODEL_REQUEST_FIELDS = new Set([
  "model",
  "prompt",
  "messages",
  "system",
  "tools",
  "cache",
  "maxOutputTokens",
  "reasoning",
  "signal",
]);
export const MODEL_QUOTA_STATUS = 429;
export const MODEL_QUOTA_ERRORS = new Set([
  "rate_limit_error",
  "rate_limit_exceeded",
  "insufficient_quota",
  "enforced_spend_limit_reached",
]);
/** Statuses reporting a transient model service outage rather than a bad request. */
export const MODEL_UNAVAILABLE_STATUSES = new Set([
  408, 500, 502, 503, 504, 529,
]);
export const MODEL_UNAVAILABLE_ERRORS = new Set([
  "overloaded_error",
  "api_error",
  "server_error",
]);

export const MODEL_DIAGNOSTIC_ERRORS = new Set([
  ...MODEL_QUOTA_ERRORS,
  ...MODEL_UNAVAILABLE_ERRORS,
  "invalid_request_error",
  "authentication_error",
  "permission_error",
  "not_found_error",
  "request_too_large",
  "invalid_api_key",
  "model_not_found",
  "context_length_exceeded",
  "invalid_value",
  "invalid_parameter",
  "unsupported_parameter",
]);
