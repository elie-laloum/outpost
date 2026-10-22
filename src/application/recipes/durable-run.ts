import { inspectRecipeWorkspace } from "../../infrastructure/recipes/workspace.ts";
import { bindRecipeWorkflow } from "./workflow.ts";
import { recipeWorkflowReport } from "./workflow-report.ts";
import { isFileSandboxOptions } from "../file-sandbox.ts";
import {
  openRecipeCheckpoint,
  recipeProjectIdentity,
} from "./durable-session.ts";
import type { RecipeProject, RecipeRunOptions } from "./project.types.ts";
import type { RecipeResumeOptions } from "./durable.types.ts";
import type { RecipeRuntimeConfiguration } from "./advanced-components.types.ts";
import type { RecipeWorkflowComponents } from "./workflow-components.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";
import type { WorkflowResult } from "../../domain/workflow.types.ts";
import {
  recipeWorkspaceKind,
  recipeWorkspaceOptions,
  recipeZoneWorkspace,
} from "./zones.ts";
import { runCleanup } from "../../domain/cleanup.ts";
import {
  createRecipeDurableResources,
  recipeDurableGitZones,
} from "./durable-resources.ts";
import {
  recipeFileDispatchCheck,
  validateRecipeWorkspaceRecoveries,
} from "./file-zones.ts";
import {
  acquireRecipeZone,
  prepareRecipeNamedFileZones,
  recipeNamedZoneReports,
} from "./zone-kinds.ts";
import type { RecipeZoneKinds } from "./zone-sandboxes.types.ts";

export async function runDurableRecipe(
  project: RecipeProject,
  configuration: RecipeRuntimeConfiguration,
  components: RecipeWorkflowComponents,
  scope: RecipeComponentScope,
  settings: RecipeRunOptions | RecipeResumeOptions,
  resume: boolean,
  signal: AbortSignal,
  observation?: ObservationHub,
) {
  if (!components.workflow.checkpoint)
    throw new Error("Recipe resume requires a configured workflow checkpoint");
  const session = await openRecipeCheckpoint(
    project,
    components.workflow.checkpoint,
    settings,
    resume,
  );
  const sandboxes = components.sandboxes ?? {};
  const resources = createRecipeDurableResources(
    session,
    configuration,
    signal,
    observation,
    sandboxes,
  );
  const recoveries =
    "workspaceRecovery" in settings ? settings.workspaceRecovery : undefined;
  if (project.model.runtime) validateRecipeWorkspaceRecoveries(recoveries);
  const files = await prepareRecipeNamedFileZones(
    project,
    scope,
    configuration.agents ?? {},
    signal,
    session,
    recoveries,
  );
  const kinds: RecipeZoneKinds = {
    git: recipeDurableGitZones(resources),
    ...(files ? { files } : {}),
  };
  try {
    for (const [key, saved] of Object.entries(
      session.previous?.recipe.resources ?? {},
    )) {
      if (saved.state === "closed") continue;
      // File workspaces restore themselves with their own records and recoveries.
      if (
        recipeWorkspaceKind(project.model, recipeZoneWorkspace(key)) === "files"
      )
        continue;
      if (!saved.record || saved.state === "allocating")
        throw new Error(`Recipe workspace ${key} requires explicit recovery`);
      const settings = key.startsWith("isolated.")
        ? components.steps[key.slice("isolated.".length)]?.isolated
        : recipeWorkspaceOptions(
            configuration,
            sandboxes,
            recipeZoneWorkspace(key),
          );
      if (!settings)
        throw new Error(`Unknown persisted recipe workspace: ${key}`);
      if (isFileSandboxOptions(settings))
        throw new Error("Git workspace record cannot restore a file task");
      await inspectRecipeWorkspace(saved.record, settings);
    }
    const workflow = bindRecipeWorkflow(
      project.document,
      {
        ...(configuration.agents ? { agents: configuration.agents } : {}),
        inputs: session.inputs,
        acquireSandbox: (context, name) =>
          acquireRecipeZone(project.model, kinds, context, name),
        ...(files
          ? { validateDispatch: recipeFileDispatchCheck(project.model) }
          : {}),
        prepareIsolated: (key, request, context) =>
          isFileSandboxOptions(request)
            ? Promise.resolve(request)
            : resources.isolated(key, request, context),
        releaseIsolated: resources.releaseIsolated,
      },
      {
        ...components,
        identity: recipeProjectIdentity(project, session.inputs),
        retryIncomplete:
          resume &&
          "retryIncomplete" in settings &&
          settings.retryIncomplete === true,
        workflow: { ...components.workflow, checkpoint: session.options },
      },
    );
    let result: WorkflowResult | undefined;
    const errors: unknown[] = [];
    try {
      result = await workflow.start({
        signal,
        ...(observation ? { observation } : {}),
        ...(resume && "answers" in settings && settings.answers
          ? { answers: settings.answers }
          : {}),
        ...(resume && "decisions" in settings && settings.decisions
          ? { decisions: settings.decisions }
          : {}),
      });
      errors.push(...result.errors);
      await files?.release();
      await resources.settle(result);
      await files?.settle(result);
    } catch (error) {
      errors.push(error);
    } finally {
      try {
        await resources.close();
      } catch (error) {
        errors.push(error);
      }
      try {
        await files?.close(result?.status === "done" && !errors.length);
      } catch (error) {
        errors.push(error);
      }
    }
    const integration = resources.integration();
    const workspaces = recipeNamedZoneReports(kinds);
    const report = scope.redact({
      ...recipeWorkflowReport(
        workflow,
        result,
        errors,
        signal,
        resources.workspace(),
      ),
      runId: session.options.runId,
      ...(integration ? { integration } : {}),
      ...(workspaces ? { workspaces } : {}),
    });
    if (result) await session.saveReport(report);
    return report;
  } finally {
    try {
      await runCleanup(
        [() => resources.close(), async () => files?.close(false)],
        [],
        { message: "Recipe workspace cleanup failed" },
      );
    } finally {
      await session.close();
    }
  }
}
