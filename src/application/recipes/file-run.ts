import { invariant } from "../../domain/errors.ts";
import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";
import type {
  WorkflowResult,
  TaskContext,
} from "../../domain/workflow.types.ts";
import type { RecipeProject, RecipeRunOptions } from "./project.types.ts";
import type {
  RecipeResumeOptions,
  RecipeCheckpointSession,
} from "./durable.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import type { RecipeReport } from "../recipe-report.types.ts";
import { bindRecipe } from "../recipe.ts";
import { bindRecipeWorkflow } from "./workflow.ts";
import { prepareRecipeWorkflow } from "./workflow-components.ts";
import { recipeWorkflowReport } from "./workflow-report.ts";
import { nativeRecipeGuards } from "./native.ts";
import { openRecipeCheckpoint } from "./durable-session.ts";
import { resolveRecipeEnvironment } from "./configuration-model.ts";
import { recipeGitZoneOptions } from "./configuration.ts";
import { runCleanup } from "../../domain/cleanup.ts";
import {
  captureRecipeFileBaselines,
  createRecipeFileZones,
  prepareRecipeFileZones,
  recipeFileDispatchCheck,
  validateRecipeFileAgents,
  validateRecipeWorkspaceRecoveries,
} from "./file-zones.ts";
import {
  acquireRecipeZone,
  createRecipeNamedGitZones,
  recipeNamedZoneReports,
} from "./zone-kinds.ts";
import type { RecipeZoneKinds } from "./zone-sandboxes.types.ts";
import { refreshRecipeFilePublications } from "./file-publication-report.ts";

function isAgent(value: unknown): value is DispatchAgent {
  return nativeRecipeGuards.agent!(value);
}

export async function runFileRecipe(
  project: RecipeProject,
  scope: RecipeComponentScope,
  settings: RecipeRunOptions | RecipeResumeOptions,
  resume: boolean,
  signal: AbortSignal,
  observation?: ObservationHub,
): Promise<RecipeReport> {
  const files = project.files;
  invariant(files, "Missing recipe file configuration");
  const fileZones = await prepareRecipeFileZones(project, scope);
  const agents: Record<string, DispatchAgent> = {};
  for (const role of project.model.agents) {
    const agent = await scope.resolve(`agents.${role}`, "agent");
    invariant(isAgent(agent), `Invalid recipe agent: ${role}`);
    agents[role] = agent;
  }
  await validateRecipeFileAgents(project, agents);
  const gitOptions = await recipeGitZoneOptions(project, scope, agents);
  const variables = resolveRecipeEnvironment(project.model.environment);
  scope.protect(Object.values(variables));
  let components =
    project.document.version === 3
      ? await prepareRecipeWorkflow(project.document, scope)
      : { workflow: {}, steps: {} };
  const recoveries =
    "workspaceRecovery" in settings ? settings.workspaceRecovery : undefined;
  validateRecipeWorkspaceRecoveries(recoveries);
  for (const [key, recovery] of Object.entries(recoveries ?? {})) {
    if (key === "shared" || (key !== "workspace" && fileZones.has(key)))
      continue;
    const step = components.steps[key];
    invariant(step, `Unknown recovery workspace: ${key}`);
    const isolated = step.isolated;
    if (isolated && "workspaceSource" in isolated && isolated.workspaceSource) {
      components = {
        ...components,
        steps: {
          ...components.steps,
          [key]: { ...step, isolated: { ...isolated, recovery } },
        },
      };
      continue;
    }
    const interactive = step.interactive;
    invariant(
      interactive && "workspaceSource" in interactive,
      "Recovery requires an owned file workspace declaration",
    );
    components = {
      ...components,
      steps: {
        ...components.steps,
        [key]: { ...step, interactive: { ...interactive, recovery } },
      },
    };
  }
  let session: RecipeCheckpointSession | undefined;
  if (components.workflow.checkpoint)
    session = await openRecipeCheckpoint(
      project,
      components.workflow.checkpoint,
      settings,
      resume,
    );
  invariant(
    !resume || session,
    "Recipe resume requires a configured workflow checkpoint",
  );
  const zones = createRecipeFileZones({
    zones: fileZones,
    runtime: files.runtime,
    scope,
    variables,
    signal,
    session,
    ...(recoveries ? { recoveries } : {}),
  });
  const git = createRecipeNamedGitZones(
    gitOptions,
    project.model.sandboxes,
    signal,
    session,
    observation,
  );
  const kinds: RecipeZoneKinds = { files: zones, ...(git ? { git } : {}) };
  const close = (complete: boolean) =>
    runCleanup(
      Object.values(kinds).map((kind) => () => kind.close(complete)),
      [],
      { message: "Recipe workspace cleanup failed" },
    );
  try {
    if (resume && session?.previous?.recipe.report?.status === "done")
      return scope.redact(session.previous.recipe.report);
    if (
      resume &&
      session?.previous?.recipe.report?.errors.some(
        (error) => error.publicationId,
      )
    ) {
      const report = await refreshRecipeFilePublications(
        session.previous.recipe.report,
        Object.fromEntries(
          [...fileZones].map(([key, zone]) => [
            key,
            {
              outputs: zone.declaration.outputs.length,
              ...(zone.retention?.policy === "portable"
                ? { transporter: zone.retention.transporter }
                : {}),
            },
          ]),
        ),
      );
      await session.saveReport(report);
      return scope.redact(report);
    }
    await captureRecipeFileBaselines(fileZones, session);
    const acquire = (taskContext: TaskContext | undefined, name?: string) =>
      acquireRecipeZone(project.model, kinds, taskContext, name);
    const inputs = session?.inputs ?? settings.inputs;
    const workflow =
      project.document.version === 3
        ? bindRecipeWorkflow(
            project.document,
            {
              agents,
              ...(inputs ? { inputs } : {}),
              acquireSandbox: acquire,
              validateDispatch: recipeFileDispatchCheck(project.model),
            },
            {
              ...components,
              sandboxes: project.model.sandboxes,
              ...(session
                ? {
                    workflow: {
                      ...components.workflow,
                      checkpoint: session.options,
                    },
                  }
                : {}),
            },
          )
        : bindRecipe(project.document, {
            sandbox: await acquire(undefined),
            agents,
            ...(inputs ? { inputs } : {}),
          });
    const errors: unknown[] = [];
    let result: WorkflowResult | undefined;
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
      for (const kind of Object.values(kinds)) await kind.release();
      for (const kind of Object.values(kinds)) await kind.settle(result);
    } catch (error) {
      errors.push(error);
    }
    const complete = () => result?.status === "done" && !errors.length;
    try {
      await close(complete());
      const main = zones.reports().get("workspace");
      const workspaces = recipeNamedZoneReports(kinds);
      const report: RecipeReport = {
        ...recipeWorkflowReport(workflow, result, errors, signal),
        ...(session ? { runId: session.options.runId } : {}),
        ...(main?.kind === "files" && main.workspaceInfo
          ? { workspaceInfo: main.workspaceInfo }
          : {}),
        fileOutputs: main?.kind === "files" ? main.fileOutputs : [],
        ...(workspaces ? { workspaces } : {}),
      };
      await session?.saveReport(report);
      return scope.redact(report);
    } finally {
      await session?.close();
    }
  } finally {
    await close(false);
    await session?.close();
  }
}
