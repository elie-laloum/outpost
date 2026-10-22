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
import type { FileSandbox } from "../file-sandbox.types.ts";
import { createFileWorkspace } from "../file-workspace.ts";
import { restoreManagedFileWorkspace } from "../task-file-workspace.ts";
import {
  createFileSandbox,
  validateFileAgent,
  validateFileSandbox,
} from "../file-sandbox.ts";
import { dispatchCandidates } from "../../domain/fallback-agent.ts";
import { workspaceOutputIdentity } from "../workspace-output-baseline.ts";
import { publishWorkspaceOutputs } from "../workspace-publication.ts";
import { fileWorkspaces } from "../file-workspace-registry.ts";
import { bindRecipe } from "../recipe.ts";
import { bindRecipeWorkflow } from "./workflow.ts";
import { prepareRecipeWorkflow } from "./workflow-components.ts";
import { recipeWorkflowReport } from "./workflow-report.ts";
import { nativeRecipeGuards } from "./native.ts";
import { openRecipeCheckpoint } from "./durable-session.ts";
import { resolveRecipeEnvironment } from "./configuration-model.ts";
import type {
  FileWorkspaceRecord,
  FileWorkspaceSource,
  WorkspacePublication,
} from "../../domain/file-workspace.types.ts";
import { runCleanup } from "../../domain/cleanup.ts";
import { createRecipeZoneSandboxes } from "./zone-sandboxes.ts";
import { recipeSandboxZone, recipeZoneOrder } from "./zones.ts";
import {
  captureRecipeFileBaselines,
  prepareRecipeFileZones,
} from "./file-zones.ts";
import type { RecipeFileZone } from "./file-zones.types.ts";
import { refreshRecipeFilePublications } from "./file-publication-report.ts";
import { workspaceRecoverySchema } from "../../domain/file-workspace.constants.ts";
import { validateJsonSchema } from "../../infrastructure/json-schema.ts";

function isProvider(value: unknown): value is SandboxProvider {
  return nativeRecipeGuards.sandboxProvider!(value);
}
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
  const runtimeOptions = files.runtime;
  const fileZones = await prepareRecipeFileZones(project, scope);
  const agents: Record<string, DispatchAgent> = {};
  for (const role of project.model.agents) {
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
  const variables = resolveRecipeEnvironment(project.model.environment);
  scope.protect(Object.values(variables));
  let components =
    project.document.version === 3
      ? await prepareRecipeWorkflow(project.document, scope)
      : { workflow: {}, steps: {} };
  const recoveries =
    "workspaceRecovery" in settings ? settings.workspaceRecovery : undefined;
  if (recoveries)
    validateJsonSchema(
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
  const zones = createRecipeZoneSandboxes<RecipeFileZone, FileSandbox>({
    async workspace(target) {
      const zone = fileZones.get(target.workspace);
      invariant(zone, `Unknown recipe workspace: ${target.workspace}`);
      const source = zone.declaration.source;
      invariant(source, "Recipe task requires a workspace source");
      const provider = await fileProvider(target.sandbox, source);
      const saved = session?.resource(zone.resource);
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
      if (saved?.fileRecord) await restore(zone, saved.fileRecord, provider);
      if (!zone.workspace) {
        await session?.saveResource(zone.resource, { state: "allocating" });
        zone.workspace = await createFileWorkspace(
          {
            source,
            runtime: files.runtime,
            inputs: zone.inputs,
            ...(zone.retention ? { retention: zone.retention } : {}),
            ...(zone.declaration.paths
              ? { paths: zone.declaration.paths }
              : {}),
          },
          (record) => persist(zone, record),
        );
        const state = fileWorkspaces.get(zone.workspace)!;
        for (const baseline of zone.baselines)
          state.publications.set(
            workspaceOutputIdentity(baseline.options),
            baseline,
          );
        await persist(zone, await zone.workspace.checkpoint());
      }
      return zone;
    },
    async sandbox(zone, target) {
      const workspace = zone.workspace!;
      return createFileSandbox(
        {
          workspace,
          sandboxProvider: await fileProvider(target.sandbox, workspace.source),
          variables,
          signal,
        },
        (record) => persist(zone, record),
      );
    },
  });
  // Workspaces recorded earlier that no resumed task reopened still publish and close.
  const settled = new Map<string, RecipeFileZone>();
  const opened = () =>
    recipeZoneOrder(new Map([...zones.workspaces, ...settled]));
  const release = (preserve: boolean) =>
    runCleanup(
      [
        () => zones.release(),
        ...opened().map(([, zone]) => async () => {
          if (zone.workspace && !fileWorkspaces.get(zone.workspace)?.active)
            await zone.workspace.close({ preserve });
        }),
      ],
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
    const acquire = (taskContext: TaskContext | undefined, name?: string) => {
      const zone = recipeSandboxZone(name, project.model.sandboxes);
      const state = fileZones.get(zone.workspace);
      if (state) state.context = taskContext;
      return zones.acquire(zone, taskContext);
    };
    const inputs = session?.inputs ?? settings.inputs;
    const workflow =
      project.document.version === 3
        ? bindRecipeWorkflow(
            project.document,
            {
              agents,
              ...(inputs ? { inputs } : {}),
              acquireSandbox: acquire,
              async validateDispatch(request) {
                for (const agent of dispatchCandidates(request.agent))
                  await validateFileAgent(agent, request);
              },
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
    const publications = new Map<string, WorkspacePublication[]>();
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
      for (const zone of fileZones.values()) zone.context = undefined;
      errors.push(...result.errors);
      await zones.release();
      if (result.status === "done")
        for (const [key, zone] of fileZones) {
          const saved = session?.resource(zone.resource);
          if (zones.workspaces.has(key) || saved?.state === "closed") continue;
          if (!saved?.fileRecord) continue;
          await restore(zone, saved.fileRecord);
          settled.set(key, zone);
        }
      if (result.status === "done")
        for (const [key, zone] of opened()) {
          const published: WorkspacePublication[] = [];
          publications.set(key, published);
          for (const output of zone.declaration.outputs)
            published.push(
              await publishWorkspaceOutputs(zone.workspace!, output),
            );
        }
    } catch (error) {
      for (const zone of fileZones.values()) zone.context = undefined;
      errors.push(error);
    }
    const complete = () => result?.status === "done" && !errors.length;
    try {
      await release(!complete());
      const records = new Map<string, FileWorkspaceRecord | undefined>();
      for (const zone of fileZones.values()) {
        const record = zone.workspace
          ? fileWorkspaces.get(zone.workspace)?.record
          : session?.resource(zone.resource)?.fileRecord;
        records.set(zone.key, record);
        if (zone.workspace && complete())
          await session?.saveResource(zone.resource, {
            state: "closed",
            ...(record ? { fileRecord: record } : {}),
          });
      }
      const workspaceInfo = records.get("workspace");
      const named = opened().filter(([key]) => key !== "workspace");
      const report: RecipeReport = {
        ...recipeWorkflowReport(workflow, result, errors, signal),
        ...(session ? { runId: session.options.runId } : {}),
        ...(workspaceInfo ? { workspaceInfo } : {}),
        fileOutputs: publications.get("workspace") ?? [],
        ...(named.length
          ? {
              workspaces: Object.fromEntries(
                named.map(([key]) => {
                  const record = records.get(key);
                  return [
                    key.slice("workspaces.".length),
                    {
                      kind: "files" as const,
                      ...(record ? { workspaceInfo: record } : {}),
                      fileOutputs: publications.get(key) ?? [],
                    },
                  ];
                }),
              ),
            }
          : {}),
      };
      await session?.saveReport(report);
      return scope.redact(report);
    } finally {
      await session?.close();
    }
  } finally {
    await release(true);
    await session?.close();
  }

  async function fileProvider(
    key: string,
    source: FileWorkspaceSource,
  ): Promise<SandboxProvider> {
    const provider = await scope.resolve(key, "sandboxProvider");
    invariant(
      isProvider(provider) && provider.workspaces,
      "Recipe sandbox provider does not support file workspaces",
    );
    await validateFileSandbox({
      workspaceSource: source,
      sandboxProvider: provider,
    });
    return provider;
  }

  async function restore(
    zone: RecipeFileZone,
    record: FileWorkspaceRecord,
    provider?: SandboxProvider,
  ) {
    const recovery = recoveries?.[zone.resource];
    zone.workspace = await restoreManagedFileWorkspace(
      record,
      {
        runtime: runtimeOptions,
        ...(zone.retention ? { retention: zone.retention } : {}),
        ...(recovery ? { recovery } : {}),
      },
      provider,
    );
    await persist(zone, await zone.workspace.checkpoint());
  }

  async function persist(zone: RecipeFileZone, record: FileWorkspaceRecord) {
    await session?.saveResource(zone.resource, {
      state: "ready",
      fileRecord: record,
    });
    await zone.context?.workspaceCheckpoint?.write(
      zone.resource,
      recipeJson(record),
    );
  }
}
