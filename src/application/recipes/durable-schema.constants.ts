export const recipeMetadataSchema = {
  type: "object",
  additionalProperties: false,
  required: ["format", "identity", "inputs", "resources"],
  properties: {
    format: { const: 1 },
    identity: { type: "string", pattern: "^[a-f0-9]{64}$" },
    inputs: { type: "object" },
    report: {
      type: "object",
      required: ["name", "status", "tasks", "outputs", "errors"],
      properties: {
        name: { type: "string" },
        status: {
          enum: [
            "done",
            "failed",
            "cancelled",
            "paused",
            "waiting-input",
            "rejected",
          ],
        },
        tasks: { type: "array", items: { type: "object" } },
        outputs: { type: "object", additionalProperties: { type: "object" } },
        errors: {
          type: "array",
          items: {
            type: "object",
            required: ["message"],
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    resources: {
      type: "object",
      additionalProperties: {
        type: "object",
        additionalProperties: false,
        required: ["state"],
        properties: {
          state: { enum: ["allocating", "ready", "integrated", "closed"] },
          record: {
            type: "object",
            additionalProperties: false,
            required: [
              "repository",
              "directory",
              "branch",
              "baseBranch",
              "baseline",
              "gitDirectories",
              "policy",
            ],
            properties: {
              repository: { type: "string", minLength: 1 },
              directory: { type: "string", minLength: 1 },
              branch: { type: "string", minLength: 1 },
              baseBranch: { type: "string" },
              baseline: { type: "string", pattern: "^[a-f0-9]{40,64}$" },
              gitDirectories: {
                type: "array",
                minItems: 1,
                items: { type: "string", minLength: 1 },
              },
              policy: {
                anyOf: [
                  {
                    type: "object",
                    additionalProperties: false,
                    required: ["mode"],
                    properties: { mode: { const: "current" } },
                  },
                  {
                    type: "object",
                    additionalProperties: false,
                    required: ["mode", "name"],
                    properties: {
                      mode: { const: "named" },
                      name: { type: "string", minLength: 1 },
                      from: { type: "string" },
                    },
                  },
                  {
                    type: "object",
                    additionalProperties: false,
                    required: ["mode"],
                    properties: {
                      mode: { const: "integrate" },
                      from: { type: "string" },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
} as const;

export const recipeUsageSchema = {
  type: "object",
  required: ["attempts", "tokens"],
  properties: {
    attempts: { type: "integer", minimum: 0 },
    tokens: {
      type: "object",
      required: ["input", "cached", "output"],
      properties: {
        input: { type: "integer", minimum: 0 },
        cached: { type: "integer", minimum: 0 },
        output: { type: "integer", minimum: 0 },
      },
    },
  },
} as const;
