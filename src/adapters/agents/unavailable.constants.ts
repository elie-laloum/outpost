/** Retry notices describe a transient condition the CLI is still handling. */
export const transientNoticePatterns = Object.freeze([
  /\bretrying\b/i,
  /\breconnecting\b/i,
]);

const connectionPatterns = [
  /\bconnection (?:failed|refused|reset)\b/i,
  /\berror sending request\b/i,
  /\b(?:ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN)\b/,
  /\b(?:502 Bad Gateway|503 Service Unavailable|504 Gateway Timeout)\b/i,
  /\bservice (?:is )?(?:temporarily )?unavailable\b/i,
];

export const claudeUnavailablePatterns = Object.freeze([
  ...connectionPatterns,
  /\bAPI Error:? \(?(?:5\d\d)\b/i,
  /\bAPI Error:? \(?Connection error/i,
  /\boverloaded_error\b/,
]);

export const codexUnavailablePatterns = Object.freeze([
  ...connectionPatterns,
  /exceeded retry limit, last status: 5\d\d/i,
  /\bstream disconnected before completion\b/i,
]);

export const copilotUnavailablePatterns = Object.freeze([
  ...connectionPatterns,
  /\bserver error\b.*\b5\d\d\b/i,
]);

export const kimiUnavailablePatterns = Object.freeze([
  ...connectionPatterns,
  /\bError code: 5\d\d\b/,
  /\bAPI(?:Connection|Timeout)Error\b/,
  /\bengine_overloaded_error\b/,
]);

export const antigravityUnavailablePatterns = Object.freeze([
  ...connectionPatterns,
  /\bUNAVAILABLE\b/,
  /\bmodel is overloaded\b/i,
]);
