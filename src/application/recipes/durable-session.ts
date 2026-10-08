import { createHash } from "node:crypto";
import { resolveRecipeInputs } from "../../domain/recipe-inputs.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import { canonicalJson } from "../../domain/workflow/canonical-json.ts";
import { validateRecipeSchema } from "../../infrastructure/recipes/schema.ts";
import { recipeMethods } from "./native.ts";
import { recipeMetadataSchema } from "./durable-schema.constants.ts";
import type { RecipeProject, RecipeRunOptions } from "./project.types.ts";
import type {
  RecipeCheckpointMetadata,
  RecipeCheckpointSession,
  RecipePersistedCheckpoint,
  RecipeResumeOptions,
} from "./durable.types.ts";
import type {
  WorkflowCheckpoint,
  WorkflowCheckpointOptions,
} from "../../domain/workflow/checkpoint.types.ts";
import type { RecipeCheckpointStore } from "../../domain/recipes/checkpoint-store.types.ts";

export function inspectableRecipeStore(
  value: unknown,
): value is RecipeCheckpointStore {
  return recipeMethods(value, ["acquire", "inspect", "recover"]);
}

export function recipeCheckpointMetadata(
  value: unknown,
): RecipeCheckpointMetadata {
  if (!recipeObject(value)) throw new Error("Invalid recipe checkpoint");
  return validateRecipeSchema<RecipeCheckpointMetadata>(
    recipeMetadataSchema,
    value.recipe,
    "recipe checkpoint metadata",
  );
}

export function recipeProjectIdentity(
  project: RecipeProject,
  inputs: RecipeRunOptions["inputs"],
): string {
  const configuration = Object.fromEntries(
    Object.entries(project.configuration).filter(
      ([key]) =>
        ![
          "reports",
          "observation",
          "observations",
          "sinks",
          "$schema",
        ].includes(key),
    ),
  );
  const document = {
    ...project.document,
    workflow: Object.fromEntries(
      Object.entries(project.document.workflow ?? {}).filter(
        ([key]) => !["answers", "decisions"].includes(key),
      ),
    ),
  };
  return createHash("sha256")
    .update(
      canonicalJson(
        recipeJson({
          document,
          configuration,
          directory: project.directory,
          inputs,
        }),
      ),
    )
    .digest("hex");
}

export async function openRecipeCheckpoint(
  project: RecipeProject,
  configured: WorkflowCheckpointOptions,
  settings: RecipeRunOptions | RecipeResumeOptions,
  resume: boolean,
): Promise<RecipeCheckpointSession> {
  const runId = settings.runId ?? configured.runId;
  if (!runId.trim()) throw new Error("Durable recipes require a runId");
  if ("recoverRevision" in settings && settings.recoverRevision) {
    if (!resume || !inspectableRecipeStore(configured.store))
      throw new Error(
        "This checkpoint store does not support explicit recovery",
      );
    await configured.store.recover(runId, settings.recoverRevision);
  }
  const lease = await configured.store.acquire(runId);
  try {
    const saved: unknown = await lease.read();
    if (!resume && saved !== undefined)
      throw new Error("Recipe run already exists; use resume explicitly");
    if (resume && saved === undefined)
      throw new Error("Recipe run does not exist");
    const previousMetadata =
      saved === undefined ? undefined : recipeCheckpointMetadata(saved);
    const inputs = resolveRecipeInputs(
      project.document.inputs,
      settings.inputs ?? previousMetadata?.inputs,
    );
    for (const [name, input] of Object.entries(project.document.inputs))
      if (input.schema)
        validateRecipeSchema(input.schema, inputs[name], `inputs.${name}`);
    const identity = recipeProjectIdentity(project, inputs);
    if (previousMetadata && previousMetadata.identity !== identity)
      throw new Error(
        "Recipe, inputs, configuration or extension versions changed; resume identity does not match",
      );
    let metadata: RecipeCheckpointMetadata = previousMetadata ?? {
      format: 1,
      identity,
      inputs,
      resources: {},
    };
    let latest: WorkflowCheckpoint | undefined;
    let previous: RecipePersistedCheckpoint | undefined;
    if (saved !== undefined) {
      if (
        !recipeObject(saved) ||
        saved.format !== 1 ||
        typeof saved.identity !== "string" ||
        typeof saved.executionId !== "string" ||
        !Array.isArray(saved.records) ||
        !recipeObject(saved.values) ||
        !recipeObject(saved.usage)
      )
        throw new Error("Invalid workflow checkpoint");
      // The scheduler validates the complete checkpoint before any task or allocation.
      previous = validateRecipeSchema<RecipePersistedCheckpoint>(
        {
          type: "object",
          required: [
            "format",
            "identity",
            "executionId",
            "records",
            "values",
            "usage",
            "recipe",
          ],
          properties: {
            format: { const: 1 },
            identity: { type: "string" },
            executionId: { type: "string" },
            records: { type: "array", items: { type: "object" } },
            values: { type: "object" },
            usage: { type: "object" },
            recipe: recipeMetadataSchema,
          },
        },
        saved,
        "recipe checkpoint",
      );
      latest = previous;
    }
    let pending = Promise.resolve();
    let closed = false;
    const persist = () => {
      if (!latest)
        throw new Error(
          "Recipe checkpoint must be initialized by its workflow before allocation",
        );
      const snapshot: RecipePersistedCheckpoint = {
        ...latest,
        recipe: structuredClone(metadata),
      };
      const operation = pending.then(() => lease.write(snapshot));
      pending = operation.catch(() => {});
      return operation;
    };
    let acquired = false;
    return {
      inputs,
      previous,
      options: {
        runId,
        version: `${configured.version}#recipe:${identity}`,
        ...("retryIncomplete" in settings && settings.retryIncomplete
          ? { resume: "retry-incomplete" }
          : {}),
        store: {
          async acquire(id) {
            if (id !== runId || acquired)
              throw new Error("Recipe checkpoint already acquired");
            acquired = true;
            return {
              read: () => Promise.resolve(saved),
              async write(checkpoint) {
                latest = checkpoint;
                await persist();
              },
              async release() {
                await pending;
              },
            };
          },
        },
      },
      resource: (key) => metadata.resources[key],
      async saveResource(key, resource) {
        metadata = {
          ...metadata,
          resources: { ...metadata.resources, [key]: resource },
        };
        await persist();
      },
      async saveReport(report) {
        metadata = { ...metadata, report };
        await persist();
      },
      async close() {
        if (closed) return;
        closed = true;
        await pending;
        await lease.release();
      },
    };
  } catch (error) {
    await lease.release();
    throw error;
  }
}
