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
