export const SUBAGENT_FIELDS = new Set(["name", "description", "agent"]);
export const SUBAGENT_INPUT = {
  type: "object",
  properties: { prompt: { type: "string", minLength: 1 } },
  required: ["prompt"],
  additionalProperties: false,
} as const;
export const MAX_DELEGATION_DEPTH = 3;
