import type { ModelReasoning } from "./model.types.ts";

export const MODEL_REASONING: ReadonlySet<ModelReasoning> = new Set([
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
]);

export const AGENT_MODEL_FIELDS: ReadonlySet<string> = new Set([
  "name",
  "reasoning",
  "maxOutputTokens",
]);
