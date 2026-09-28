export const claudeQuotaPatterns = Object.freeze([
  /You['’]ve hit your (?:session |weekly |Opus |Sonnet |usage credit )?limit/i,
  /usage limit reached/i,
  /Request rejected \(429\)/i,
]);

export const codexQuotaPatterns = Object.freeze([
  /You['’]ve hit your usage limit/i,
  /Usage limit reached/i,
  /Quota exceeded/i,
  /exceeded retry limit, last status: 429/i,
]);

export const copilotQuotaPatterns = Object.freeze([
  /You['’]ve (?:hit|reached) (?:your |the )?(?:session |weekly )?rate limit/i,
  /run out of your included AI credits/i,
  /reached the spending limit/i,
  /wait for your limit to reset/i,
]);

export const kimiQuotaPatterns = Object.freeze([
  /exceeded_current_quota_error/i,
  /insufficient_quota/i,
  /exceeded your current (?:token )?quota/i,
  /check your account balance|insufficient balance/i,
  /provider\.rate_limit/i,
]);

export const antigravityQuotaPatterns = Object.freeze([
  /exhausted your quota/i,
  /RESOURCE_EXHAUSTED/,
]);

export const claudeQuotaErrors = new Set(["rate_limit", "billing_error"]);
export const copilotQuotaErrors = new Set(["quota", "rate_limit"]);
