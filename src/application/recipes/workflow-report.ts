import { recipeDiagnostic } from "../recipe-report.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import type { RecipeReport } from "../recipe-report.types.ts";
import type { Workflow, WorkflowResult } from "../../domain/workflow.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";

export function recipeWorkflowReport(
  workflow: Workflow,
  result: WorkflowResult | undefined,
  errors: readonly unknown[],
  signal: AbortSignal,
  workspace?: RecipeReport["workspace"],
): RecipeReport {
  const outputs: Record<string, Readonly<Record<string, WorkflowJson>>> = {};
  for (const task of workflow.tasks) {
    if (
      result?.tasks.find((record) => record.key === task.key)?.status !== "done"
    )
      continue;
    const value = result.value(task);
    if (value === undefined) {
      outputs[task.key] = {};
      continue;
    }
    const projection = recipeJson(value);
    outputs[task.key] = recipeObject(projection)
      ? Object.fromEntries(
          Object.entries(projection).map(([key, item]) => [
            key,
            recipeJson(item),
          ]),
        )
      : { value: projection };
  }
  return {
    name: workflow.name,
    ...(result
      ? {
          executionId: result.executionId,
          workflowStatus: result.status,
          usage: result.usage,
          inputRequests: result.inputRequests,
        }
      : {}),
    status: signal.aborted
      ? "cancelled"
      : errors.length
        ? "failed"
        : (result?.status ?? "failed"),
    tasks: result?.tasks ?? [],
    outputs,
    errors: errors.map((error) => recipeDiagnostic(error)),
    ...(workspace ? { workspace } : {}),
    ...(result?.observerErrors.length
      ? {
          observerErrors: result.observerErrors.map((error) =>
            recipeDiagnostic(error),
          ),
        }
      : {}),
  };
}
