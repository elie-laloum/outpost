import { runCleanup } from "../../domain/cleanup.ts";
import { recipeWorkflowReport } from "./workflow-report.ts";
import { bindRecipeWorkflow } from "./workflow.ts";
import { createRecipeGitZones } from "./git-zones.ts";
import { recipeFileDispatchCheck } from "./file-zones.ts";
import { acquireRecipeZone, recipeNamedZoneReports } from "./zone-kinds.ts";
import { recipeSandboxZone } from "./zones.ts";
import type { RecipeValue } from "../../domain/recipe.types.ts";
import type { RecipeRuntimeConfiguration } from "./advanced-components.types.ts";
import type { RecipeWorkflowComponents } from "./workflow-components.types.ts";
import type { RecipeReport } from "../recipe-report.types.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";
import type { WorkflowResult } from "../../domain/workflow.types.ts";
import type { FileSandbox } from "../file-sandbox.types.ts";
import type { RecipeProject } from "./project.types.ts";
import type {
  RecipeZoneKind,
  RecipeZoneKinds,
} from "./zone-sandboxes.types.ts";

export async function runRecipeWorkflow(
  project: RecipeProject,
  configuration: RecipeRuntimeConfiguration,
  inputs: Readonly<Record<string, RecipeValue>>,
  components: RecipeWorkflowComponents,
  signal: AbortSignal,
  observation?: ObservationHub,
  files?: RecipeZoneKind<FileSandbox>,
): Promise<RecipeReport> {
  const { document, model } = project;
  const git = createRecipeGitZones(configuration, signal, observation);
  const kinds: RecipeZoneKinds = { git, ...(files ? { files } : {}) };
  const close = (complete: boolean) =>
    runCleanup(
      Object.values(kinds).map((kind) => () => kind.close(complete)),
      [],
      { message: "Recipe workspace cleanup failed" },
    );
  let result: WorkflowResult | undefined;
  const errors: unknown[] = [];
  const workflow = bindRecipeWorkflow(
    document,
    {
      ...(configuration.agents ? { agents: configuration.agents } : {}),
      inputs,
      acquireSandbox: (context, name) =>
        acquireRecipeZone(model, kinds, context, name),
      ...(files ? { validateDispatch: recipeFileDispatchCheck(model) } : {}),
    },
    components,
  );
  // The configuration sandbox opens before the run, as it did before named sandboxes.
  if (
    document.tasks.some(
      (step) => (step.command || step.agent) && step.sandbox === undefined,
    )
  )
    try {
      await git.acquire(recipeSandboxZone(undefined, {}));
    } catch (error) {
      await runCleanup([() => close(false)], [error], {
        message: "Recipe allocation and cleanup failed",
      });
      throw error;
    }
  try {
    result = await workflow.start({
      signal,
      ...(observation ? { observation } : {}),
    });
    errors.push(...result.errors);
    for (const kind of Object.values(kinds)) await kind.release();
    for (const kind of Object.values(kinds)) await kind.settle(result);
  } catch (error) {
    errors.push(error);
  }
  try {
    for (const kind of Object.values(kinds)) await kind.release();
  } catch (error) {
    errors.push(error);
  }
  try {
    await close(result?.status === "done" && !errors.length);
  } catch (error) {
    errors.push(error);
  }
  const main = git.reports().get("workspace");
  const workspaces = recipeNamedZoneReports(kinds);
  return {
    ...recipeWorkflowReport(
      workflow,
      result,
      errors,
      signal,
      main?.kind === "git"
        ? {
            branch: main.branch,
            directory: main.directory,
            ...(main.retainedDirectory
              ? { retainedDirectory: main.retainedDirectory }
              : {}),
          }
        : undefined,
    ),
    ...(main?.kind === "git" && main.integration
      ? { integration: main.integration }
      : {}),
    ...(workspaces ? { workspaces } : {}),
  };
}
