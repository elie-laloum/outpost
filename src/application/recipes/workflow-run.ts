import { createSandbox } from "../sandbox.ts";
import { bindRecipeWorkflow, recipeHasSharedSandbox } from "./workflow.ts";
import { recipeDiagnostic } from "../recipe-report.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import type { RecipeDocument, RecipeValue } from "../../domain/recipe.types.ts";
import type { RecipeConfiguration } from "../recipe.types.ts";
import type { RecipeWorkflowComponents } from "./workflow-components.types.ts";
import type { RecipeReport } from "../recipe-report.types.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";
import type { Sandbox } from "../outpost.types.ts";
import type { WorkflowResult } from "../../domain/workflow.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";

export async function runRecipeWorkflow(
  document: RecipeDocument,
  configuration: RecipeConfiguration,
  inputs: Readonly<Record<string, RecipeValue>>,
  components: RecipeWorkflowComponents,
  signal: AbortSignal,
  observation?: ObservationHub,
): Promise<RecipeReport> {
  let sandbox: Sandbox | undefined;
  let result: WorkflowResult | undefined;
  let workspace: RecipeReport["workspace"];
  const errors: unknown[] = [];
  const workflow = bindRecipeWorkflow(
    document,
    {
      ...configuration,
      inputs,
      get sandbox() {
        return sandbox;
      },
    },
    components,
  );
  let integrated = false;
  if (recipeHasSharedSandbox(document))
    sandbox = await createSandbox({
      ...configuration.sandbox,
      signal,
      ...(observation ? { observation } : {}),
    });
  try {
    result = await workflow.start({
      signal,
      ...(observation ? { observation } : {}),
    });
    errors.push(...result.errors);
    if (sandbox && result.status === "done") {
      signal.throwIfAborted();
      await sandbox.workspace.integrate({ signal });
      integrated = true;
    }
  } catch (error) {
    errors.push(error);
  } finally {
    if (sandbox) {
      workspace = {
        branch: sandbox.workspace.branch,
        directory: sandbox.workspace.directory,
      };
      try {
        const disposal = await sandbox.close({
          preserve: !integrated || signal.aborted,
        });
        workspace = {
          ...workspace,
          ...disposal,
          ...(!integrated && sandbox.workspace.policy.mode !== "current"
            ? { retainedDirectory: sandbox.workspace.directory }
            : {}),
        };
      } catch (error) {
        errors.push(error);
      }
    }
  }
  const outputs: Record<string, Readonly<Record<string, WorkflowJson>>> = {};
  for (const task of workflow.tasks) {
    if (
      result?.tasks.find((record) => record.key === task.key)?.status !== "done"
    )
      continue;
    const value = result.value(task);
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
    name: document.name,
    ...(result
      ? {
          executionId: result.executionId,
          workflowStatus: result.status,
          usage: result.usage,
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
