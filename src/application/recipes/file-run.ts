import { recipeRecord } from "../../domain/recipes/values.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import { invariant } from "../../domain/errors.ts";
import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";
import type { SandboxProvider } from "../../domain/sandbox.types.ts";
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
import type { FileWorkspace } from "../file-workspace.types.ts";
import type { FileSandbox } from "../file-sandbox.types.ts";
import { createFileWorkspace } from "../file-workspace.ts";
import { restoreManagedFileWorkspace } from "../task-file-workspace.ts";
import {
  createFileSandbox,
  validateFileAgent,
  validateFileSandbox,
} from "../file-sandbox.ts";
import { dispatchCandidates } from "../../domain/fallback-agent.ts";
import {
  captureWorkspaceOutputBaseline,
  workspaceOutputIdentity,
} from "../workspace-output-baseline.ts";
import { publishWorkspaceOutputs } from "../workspace-publication.ts";
import { fileWorkspaces } from "../file-workspace-registry.ts";
import { bindRecipe } from "../recipe.ts";
import { bindRecipeWorkflow } from "./workflow.ts";
import { prepareRecipeWorkflow } from "./workflow-components.ts";
import { recipeWorkflowReport } from "./workflow-report.ts";
import { nativeRecipeGuards } from "./native.ts";
import { openRecipeCheckpoint } from "./durable-session.ts";
import { configurationVariable } from "../recipe-configuration-values.ts";
import type { Transport } from "../../domain/transport.types.ts";
import type { WorkspaceRetention } from "../../domain/file-workspace.types.ts";
import { refreshFilePublicationReport } from "./file-publication-report.ts";
import { workspaceRecoverySchema } from "../../domain/file-workspace.constants.ts";
import { validateRecipeSchema } from "../../infrastructure/recipes/schema.ts";

function isProvider(value: unknown): value is SandboxProvider {
  return nativeRecipeGuards.sandboxProvider!(value);
}
function isAgent(value: unknown): value is DispatchAgent {
  return nativeRecipeGuards.agent!(value);
}
function isTransport(value: unknown): value is Transport {
  return nativeRecipeGuards.transport!(value);
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
  let retention: WorkspaceRetention | undefined;
  if (files.retention?.policy === "portable") {
    const transporter = await scope.resolve(
      files.retention.transporter,
      "transport",
    );
    invariant(
      isTransport(transporter),
      "Invalid workspace retention Transport",
    );
    retention = { policy: "portable", transporter };
  }
  if (files.retention?.policy === "run" || files.retention?.policy === "local")
    retention = files.retention;
  const workspaceInputs = await Promise.all(
    (files.inputs ?? []).map(async (input) => {
      if ("directory" in input) return input;
      const transporter = await scope.resolve(input.transporter, "transport");
      invariant(isTransport(transporter), "Invalid workspace input Transport");
      return { snapshot: input.snapshot, transporter };
    }),
  );
  const agents: Record<string, DispatchAgent> = {};
  for (const role of Object.keys(
    recipeRecord(project.configuration.agents ?? {}, "agents"),
  )) {
    const agent = await scope.resolve(`agents.${role}`, "agent");
    invariant(isAgent(agent), `Invalid recipe agent: ${role}`);
    agents[role] = agent;
  }
  for (const role of new Set(
    project.document.tasks.flatMap((task) => (task.agent ? [task.agent] : [])),
  )) {
    const agent = agents[role];
    invariant(agent, `Missing recipe agent: ${role}`);
    for (const candidate of dispatchCandidates(agent))
      await validateFileAgent(candidate);
  }
  const variables = Object.fromEntries(
    Object.entries(
      recipeRecord(project.configuration.environment ?? {}, "environment"),
    ).map(([name, selection]) => {
      configurationVariable(name);
      const selected = configurationVariable(selection);
      const value = process.env[selected];
      invariant(
        value !== undefined,
        `Missing declared environment variable: ${selected}`,
      );
      return [name, value];
    }),
  );
  scope.protect(Object.values(variables));
  let components =
    project.document.version === 3
      ? await prepareRecipeWorkflow(project.document, scope)
      : { workflow: {}, steps: {} };
  const recoveries =
    "workspaceRecovery" in settings ? settings.workspaceRecovery : undefined;
  if (recoveries)
    validateRecipeSchema(
      workspaceRecoverySchema,
      recoveries,
      "workspace recovery",
    );
  for (const [key, recovery] of Object.entries(recoveries ?? {})) {
    invariant(
      recovery.processesStopped === true &&
        typeof recovery.expectedRevision === "string" &&
        recovery.expectedRevision.length > 0,
      "Workspace recovery requires stopped-process authorization and an inspected revision",
    );
    invariant(
      Object.keys(recovery).every((field) =>
        [
          "expectedRevision",
          "processesStopped",
          "allocationReleased",
          "adoptInterruptedFiles",
          "adoptMountedSource",
        ].includes(field),
      ),
      "Unsupported workspace recovery option",
    );
    if (key === "shared") continue;
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
  let workspace: FileWorkspace | undefined;
  let sandbox: FileSandbox | undefined;
  try {
    if (resume && session?.previous?.recipe.report?.status === "done")
      return scope.redact(session.previous.recipe.report);
    if (
      resume &&
      session?.previous?.recipe.report?.errors.some(
        (error) => error.publicationId,
      )
    ) {
      const report = await refreshFilePublicationReport(
        session.previous.recipe.report,
        files.outputs.length,
        retention?.policy === "portable" ? retention.transporter : undefined,
      );
      await session.saveReport(report);
      return scope.redact(report);
    }
    const baselines = session?.resource("shared")
      ? []
      : await Promise.all(
          files.outputs.map((output) => captureWorkspaceOutputBaseline(output)),
        );
    let context: TaskContext | undefined;
    const persist = async (
      record: import("../../domain/file-workspace.types.ts").FileWorkspaceRecord,
    ) => {
      await session?.saveResource("shared", {
        state: "ready",
        fileRecord: record,
      });
      await context?.workspaceCheckpoint?.write("shared", recipeJson(record));
    };
    const acquire = async (taskContext?: TaskContext) => {
      context = taskContext;
      if (sandbox) return sandbox;
      invariant(files.source, "Recipe task requires a workspace source");
      const provider = await scope.resolve("sandbox", "sandboxProvider");
      invariant(
        isProvider(provider) && provider.workspaces,
        "Recipe sandbox provider does not support file workspaces",
      );
      await validateFileSandbox({
        workspaceSource: files.source,
        sandboxProvider: provider,
      });
      const saved = session?.resource("shared");
      invariant(
        !saved || saved.state !== "allocating" || saved.fileRecord,
        "Recipe workspace allocation requires explicit recovery",
      );
      invariant(
        !saved || saved.state === "closed" || saved.fileRecord,
        "Persisted recipe workspace record is missing",
      );
      invariant(
        !saved || saved.state !== "closed",
        "Completed workspace cannot be silently reconstructed",
      );
      if (saved?.fileRecord) {
        workspace = await restoreManagedFileWorkspace(
          saved.fileRecord,
          {
            runtime: files.runtime,
            ...(retention ? { retention } : {}),
            ...(recoveries?.shared ? { recovery: recoveries.shared } : {}),
          },
          provider,
        );
        await persist(await workspace.checkpoint());
      }
      if (!workspace) {
        await session?.saveResource("shared", { state: "allocating" });
        workspace = await createFileWorkspace(
          {
            source: files.source,
            runtime: files.runtime,
            inputs: workspaceInputs,
            ...(retention ? { retention } : {}),
            ...(files.paths ? { paths: files.paths } : {}),
          },
          persist,
        );
        const state = fileWorkspaces.get(workspace)!;
        for (const baseline of baselines)
          state.publications.set(
            workspaceOutputIdentity(baseline.options),
            baseline,
          );
        await persist(await workspace.checkpoint());
      }
      sandbox = await createFileSandbox(
        { workspace, sandboxProvider: provider, variables, signal },
        persist,
      );
      return sandbox;
    };
    const inputs = session?.inputs ?? settings.inputs;
    const workflow =
      project.document.version === 3
        ? bindRecipeWorkflow(
            project.document,
            {
              agents,
              ...(inputs ? { inputs } : {}),
              acquireSandbox: async (ctx) => acquire(ctx),
              async validateDispatch(request) {
                for (const agent of dispatchCandidates(request.agent))
                  await validateFileAgent(agent, request);
              },
            },
            {
              ...components,
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
            sandbox: await acquire(),
            agents,
            ...(inputs ? { inputs } : {}),
          });
    const errors: unknown[] = [];
    let result: WorkflowResult | undefined;
    const publications = [];
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
      context = undefined;
      errors.push(...result.errors);
      await sandbox?.close({ preserve: true });
      if (result.status === "done" && workspace)
        for (const output of files.outputs)
          publications.push(await publishWorkspaceOutputs(workspace, output));
    } catch (error) {
      context = undefined;
      errors.push(error);
    }
    let workspaceInfo = workspace
      ? fileWorkspaces.get(workspace)?.record
      : session?.resource("shared")?.fileRecord;
    try {
      await sandbox?.close({ preserve: true });
      if (workspace && !fileWorkspaces.get(workspace)?.active)
        await workspace.close({
          preserve: result?.status !== "done" || errors.length > 0,
        });
      if (workspace) workspaceInfo = fileWorkspaces.get(workspace)?.record;
      if (workspace && result?.status === "done" && !errors.length)
        await session?.saveResource("shared", {
          state: "closed",
          ...(workspaceInfo ? { fileRecord: workspaceInfo } : {}),
        });
      const report: RecipeReport = {
        ...recipeWorkflowReport(workflow, result, errors, signal),
        ...(session ? { runId: session.options.runId } : {}),
        ...(workspaceInfo ? { workspaceInfo } : {}),
        fileOutputs: publications,
      };
      await session?.saveReport(report);
      return scope.redact(report);
    } finally {
      await session?.close();
    }
  } finally {
    await sandbox?.close({ preserve: true });
    if (workspace && !fileWorkspaces.get(workspace)?.active)
      await workspace.close({ preserve: true });
    await session?.close();
  }
}
