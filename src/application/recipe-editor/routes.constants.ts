import { recipeEditorStarters } from "./starters.constants.ts";

const role = { enum: ["recipe", "config"] } as const;
const revision = { type: "integer", minimum: 0 } as const;
const key = { type: "string", minLength: 1, maxLength: 512 } as const;
const path = {
  type: "array",
  minItems: 1,
  maxItems: 64,
  items: { anyOf: [{ type: "string" }, { type: "integer", minimum: 0 }] },
} as const;

function operation(
  type: string,
  properties: Readonly<Record<string, unknown>>,
  required: readonly string[],
) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["type", ...required],
    properties: { type: { const: type }, ...properties },
  } as const;
}

/** Answer or unsigned decision fields addressed to one pending request. */
function intervention(fields: Readonly<Record<string, unknown>>) {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "executionId",
      "key",
      "requestId",
      "actor",
      ...Object.keys(fields),
    ],
    properties: {
      executionId: key,
      key,
      requestId: key,
      actor: key,
      ...fields,
    },
  } as const;
}

export const recipeEditorRequestSchemas = {
  open: {
    type: "object",
    additionalProperties: false,
    required: ["recipe"],
    properties: {
      recipe: { type: "string", minLength: 1, maxLength: 4096 },
      config: { type: "string", minLength: 1, maxLength: 4096 },
      starter: { enum: Object.keys(recipeEditorStarters) },
    },
  },
  edit: {
    type: "object",
    additionalProperties: false,
    required: ["role", "operations", "revision"],
    properties: {
      role,
      revision,
      operations: {
        type: "array",
        maxItems: 100,
        items: {
          oneOf: [
            operation(
              "add-task",
              {
                task: { type: "object" },
                index: { type: "integer", minimum: 0 },
              },
              ["task"],
            ),
            operation("remove-task", { key }, ["key"]),
            operation("rename-task", { key, to: key }, ["key", "to"]),
            operation(
              "move-task",
              { key, index: { type: "integer", minimum: 0 } },
              ["key", "index"],
            ),
            operation("connect", { source: key, target: key }, [
              "source",
              "target",
            ]),
            operation("disconnect", { source: key, target: key }, [
              "source",
              "target",
            ]),
            operation("set", { path, value: {} }, ["path"]),
          ],
        },
      },
    },
  },
  text: {
    type: "object",
    additionalProperties: false,
    required: ["role", "text", "revision"],
    properties: { role, revision, text: { type: "string" } },
  },
  layout: {
    type: "object",
    additionalProperties: false,
    required: ["layout", "revision"],
    properties: { revision, layout: { type: "object" } },
  },
  revision: {
    type: "object",
    additionalProperties: false,
    required: ["revision"],
    properties: { revision },
  },
  extension: {
    type: "object",
    additionalProperties: false,
    required: ["name", "kind", "module", "export", "revision"],
    properties: {
      name: key,
      kind: key,
      contract: key,
      module: { type: "string", minLength: 1, maxLength: 4096 },
      export: key,
      function: key,
      revision,
    },
  },
  module: {
    type: "object",
    additionalProperties: false,
    required: ["path", "text", "hash"],
    properties: {
      path: { type: "string", minLength: 1, maxLength: 4096 },
      text: { type: "string" },
      hash: { anyOf: [{ type: "string" }, { type: "null" }] },
    },
  },
  run: {
    oneOf: [
      {
        type: "object",
        additionalProperties: false,
        required: ["action"],
        properties: {
          action: { const: "run" },
          inputs: {
            type: "object",
            maxProperties: 100,
            additionalProperties: { type: "string", maxLength: 65_536 },
          },
          runId: key,
        },
      },
      {
        type: "object",
        additionalProperties: false,
        required: ["action", "from"],
        properties: {
          action: { const: "resume" },
          from: key,
          retryIncomplete: { type: "boolean" },
        },
      },
      {
        type: "object",
        additionalProperties: false,
        required: ["action", "from", "answer"],
        properties: {
          action: { const: "answer" },
          from: key,
          answer: intervention({
            value: { type: "string", maxLength: 65_536 },
          }),
        },
      },
      {
        type: "object",
        additionalProperties: false,
        required: ["action", "from", "decision"],
        properties: {
          action: { const: "decide" },
          from: key,
          decision: intervention({
            action: { enum: ["approve", "resume", "reject"] },
            reason: { type: "string", maxLength: 4096 },
          }),
        },
      },
    ],
  },
  runId: {
    type: "object",
    additionalProperties: false,
    required: ["id"],
    properties: { id: key },
  },
  save: {
    type: "object",
    additionalProperties: false,
    properties: { overwrite: { type: "boolean" } },
  },
} as const;

export const recipeEditorServerDefaults = {
  diskPollMs: 2_000,
  directoryEntries: 500,
} as const;
