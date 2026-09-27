export const cloudStageCategories = {
  allocation: "allocation",
  "lease-contract": "contract",
  "agent-cli-contract": "agent-cli",
  "authenticated-model-turn": "model-access",
} as const;

export const cloudFailurePatterns = [
  {
    reason: "quota-exceeded",
    pattern:
      /insufficient_quota|rate_limit(?:_error|_exceeded)?|quota[_ ](?:exceeded|exhausted)|credit balance is too low|exceeded your current quota|too many requests/i,
  },
  {
    reason: "authentication-rejected",
    pattern:
      /invalid_api_key|authentication_error|invalid (?:x-api-key|api[- ]?key|credentials|authentication)|incorrect api key|unauthorized|not authorized|please (?:log in|run .*login)/i,
  },
  {
    reason: "model-unavailable",
    pattern:
      /model_not_found|not_found_error|model .* (?:does not exist|not found|not supported)|do not have access to (?:this|the) model/i,
  },
  {
    reason: "network-unreachable",
    pattern:
      /\b(?:ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH|UND_ERR_CONNECT_TIMEOUT)\b|fetch failed|connection (?:refused|reset)|network (?:is unreachable|error)/i,
  },
  {
    reason: "deadline-exceeded",
    pattern: /\b(?:TimeoutError|ETIMEDOUT)\b|request timed out/i,
  },
] as const;

export const cloudHttpFailures = {
  401: "authentication-rejected",
  403: "authentication-rejected",
  408: "deadline-exceeded",
  429: "quota-exceeded",
  504: "deadline-exceeded",
} as const;
