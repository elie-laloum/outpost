import { recipeUsageSchema } from "./durable-schema.constants.ts";
import { recipeObject, recipeReference } from "../../domain/recipes/values.ts";
import { validateRecipeSchema } from "../../infrastructure/recipes/schema.ts";
import {
  inspectableRecipeStore,
  recipeCheckpointMetadata,
} from "./durable-session.ts";
import type { RecipeProject } from "./project.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import type { RecipeRunStatus } from "./durable.types.ts";
import type { TaskRecord } from "../../domain/workflow.types.ts";
import type { WorkflowUsage } from "../../domain/workflow/budget.types.ts";

export async function inspectRecipeRun(
  project: RecipeProject,
  scope: RecipeComponentScope,
  runId: string,
): Promise<RecipeRunStatus | undefined> {
  const checkpoint = project.graph.nodes.get("workflow")?.options.checkpoint;
  if (!recipeObject(checkpoint))
    throw new Error("Recipe status requires a configured workflow checkpoint");
  const reference = recipeReference(checkpoint.store);
  if (!reference) throw new Error("Invalid checkpoint store reference");
  const store = await scope.resolve(reference, "checkpointStore");
  if (!inspectableRecipeStore(store))
    throw new Error(
      "This checkpoint store does not support read-only inspection",
    );
  const inspection = await store.inspect(runId);
  if (!inspection) return undefined;
  const saved = inspection.checkpoint;
  if (saved === undefined)
    return {
      runId,
      revision: inspection.revision,
      owned: inspection.owned,
      tasks: [],
      workspaces: {},
    };
  if (!recipeObject(saved) || !Array.isArray(saved.records))
    throw new Error("Invalid workflow checkpoint");
  const metadata = recipeCheckpointMetadata(saved);
  const tasks = saved.records.map((record) => {
    if (!recipeObject(record)) throw new Error("Invalid workflow task record");
    return validateRecipeSchema<TaskRecord>(
      {
        type: "object",
        required: ["key", "status", "attempts"],
        properties: {
          key: { type: "string" },
          status: {
            enum: [
              "waiting-input",
              "waiting",
              "active",
              "done",
              "failed",
              "skipped",
              "cancelled",
              "paused",
              "rejected",
            ],
          },
          attempts: { type: "integer", minimum: 0 },
        },
        additionalProperties: false,
      },
      { key: record.key, status: record.status, attempts: record.attempts },
      "checkpoint task",
    );
  });
  const usage = validateRecipeSchema<WorkflowUsage>(
    recipeUsageSchema,
    saved.usage,
    "checkpoint usage",
  );
  return {
    runId,
    revision: inspection.revision,
    owned: inspection.owned,
    ...(typeof saved.executionId === "string"
      ? { executionId: saved.executionId }
      : {}),
    ...(!inspection.owned && metadata.report
      ? { report: metadata.report }
      : {}),
    tasks,
    usage,
    workspaces: metadata.resources,
  };
}
