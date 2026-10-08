import { bindRecipe } from "./recipe.ts";
import type { RecipeBindings } from "./recipe.types.ts";
import type { RecipeDocument } from "../domain/recipe.types.ts";
import type { Workflow, WorkflowResult } from "../domain/workflow.types.ts";
import type { Disposal } from "../domain/workspace.types.ts";
import { recipeDiagnostic, recipeOutput } from "./recipe-report.ts";
import type { RecipeReport } from "./recipe-report.types.ts";
import type { ObservationHub } from "../domain/observation.types.ts";
import type { RecipeDispatchSettings } from "./recipes/agent-components.types.ts";

export async function runRecipe(
  document: RecipeDocument,
  bindings: RecipeBindings,
  signal: AbortSignal,
  observation?: ObservationHub,
  requests?: Readonly<Record<string, RecipeDispatchSettings>>,
): Promise<RecipeReport> {
  const { sandbox } = bindings;
  let result: WorkflowResult | undefined;
  let workflow: Workflow | undefined;
  let completed = false;
  let disposal: Disposal = {};
  const errors: unknown[] = [];
  try {
    workflow = bindRecipe(document, bindings, requests);
    result = await workflow.start({
      signal,
      ...(observation ? { observation } : {}),
    });
    errors.push(...result.errors);
    if (result.status === "done") {
      signal.throwIfAborted();
      await sandbox.workspace.integrate({ signal });
      completed = true;
    }
  } catch (error) {
    errors.push(error);
  } finally {
    try {
      disposal = await sandbox.close({
        preserve: !completed || signal.aborted,
      });
    } catch (error) {
      errors.push(error);
    }
  }
  const outputs = Object.fromEntries(
    (workflow?.tasks ?? []).flatMap((task) => {
      if (
        result?.tasks.find((record) => record.key === task.key)?.status !==
        "done"
      )
        return [];
      return [[task.key, recipeOutput(result.value(task))]];
    }),
  );
  let status = result?.status ?? "failed";
  if (errors.length) status = "failed";
  if (signal.aborted) status = "cancelled";
  return {
    name: document.name,
    ...(result
      ? {
          executionId: result.executionId,
          workflowStatus: result.status,
          usage: result.usage,
        }
      : {}),
    status,
    tasks: result?.tasks ?? [],
    outputs,
    errors: errors.map((error) => recipeDiagnostic(error)),
    workspace: {
      branch: sandbox.workspace.branch,
      directory: sandbox.workspace.directory,
      ...disposal,
      ...(!completed && sandbox.workspace.policy.mode !== "current"
        ? { retainedDirectory: sandbox.workspace.directory }
        : {}),
    },
  };
}
