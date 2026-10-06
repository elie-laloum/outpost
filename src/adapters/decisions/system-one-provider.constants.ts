export {
  MODEL_TIMEOUT_MS as DECISION_TIMEOUT_MS,
  MODEL_RESPONSE_BYTES as DECISION_RESPONSE_BYTES,
  MODEL_MAX_TIMEOUT_MS as DECISION_MAX_TIMEOUT_MS,
  MODEL_UNAVAILABLE_STATUSES as DECISION_UNAVAILABLE_STATUSES,
} from "../models/model.constants.ts";

export const SYSTEM_ONE_PROVIDER_FIELDS = new Set([
  "baseUrl",
  "apiKey",
  "timeoutMs",
  "maxResponseBytes",
]);
