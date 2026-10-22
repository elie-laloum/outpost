import { runCleanup } from "../../domain/cleanup.ts";
import { invariant } from "../../domain/errors.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import type {
  FileWorkspaceRecord,
  FileWorkspaceSource,
  WorkspaceInput,
  WorkspacePublication,
  WorkspaceRetention,
} from "../../domain/file-workspace.types.ts";
import type { SandboxProvider } from "../../domain/sandbox.types.ts";
import { createFileSandbox, validateFileSandbox } from "../file-sandbox.ts";
import type { FileSandbox } from "../file-sandbox.types.ts";
import { createFileWorkspace } from "../file-workspace.ts";
import { fileWorkspaces } from "../file-workspace-registry.ts";
import { restoreManagedFileWorkspace } from "../task-file-workspace.ts";
import { publishWorkspaceOutputs } from "../workspace-publication.ts";
import { createRecipeZoneSandboxes } from "./zone-sandboxes.ts";
import type { RecipeZoneKind } from "./zone-sandboxes.types.ts";
import type { Transport } from "../../domain/transport.types.ts";
import {
  captureWorkspaceOutputBaseline,
  workspaceOutputIdentity,
} from "../workspace-output-baseline.ts";
import { nativeRecipeGuards } from "./native.ts";
import {
  recipeFileTasks,
  recipeSandboxZone,
  recipeWorkspaceKind,
  recipeZoneOrder,
  recipeZoneResource,
} from "./zones.ts";
import { dispatchCandidates } from "../../domain/fallback-agent.ts";
import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";
import { validateFileAgent } from "../file-agent-validation.ts";
import type { RecipeExecutionBindings } from "./workflow-components.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import type {
  RecipeCheckpointSession,
  RecipeResumeOptions,
} from "./durable.types.ts";
import { workspaceRecoverySchema } from "../../domain/file-workspace.constants.ts";
import { validateJsonSchema } from "../../infrastructure/json-schema.ts";
import type { RecipeFileWorkspaceDeclaration } from "./file-configuration.types.ts";
import type { RecipeProject } from "./project.types.ts";
import type {
  RecipeFileZone,
  RecipeFileZonesOptions,
} from "./file-zones.types.ts";

function isTransport(value: unknown): value is Transport {
  return nativeRecipeGuards.transport!(value);
}

/** Resolves the Transports of each file workspace, the configuration one first, before any allocation. */
export async function prepareRecipeFileZones(
  project: RecipeProject,
  scope: RecipeComponentScope,
): Promise<Map<string, RecipeFileZone>> {
  const main: [string, RecipeFileWorkspaceDeclaration][] = project.files
    ? [["workspace", project.files]]
    : [];
  const declarations: [string, RecipeFileWorkspaceDeclaration][] = [
    ...main,
    ...Object.entries(project.model.workspaces).flatMap(([name, workspace]) =>
      workspace.kind === "files"
        ? [
            [`workspaces.${name}`, workspace.files] as [
              string,
              RecipeFileWorkspaceDeclaration,
            ],
          ]
        : [],
    ),
  ];
  const zones = new Map<string, RecipeFileZone>();
  for (const [key, declaration] of declarations) {
    let retention: WorkspaceRetention | undefined;
    if (declaration.retention?.policy === "portable") {
      const transporter = await scope.resolve(
        declaration.retention.transporter,
        "transport",
      );
      invariant(
        isTransport(transporter),
        "Invalid workspace retention Transport",
      );
      retention = { policy: "portable", transporter };
    }
    if (
      declaration.retention?.policy === "run" ||
      declaration.retention?.policy === "local"
    )
      retention = declaration.retention;
    const inputs: WorkspaceInput[] = await Promise.all(
      (declaration.inputs ?? []).map(async (input) => {
        if ("directory" in input) return input;
        const transporter = await scope.resolve(input.transporter, "transport");
        invariant(
          isTransport(transporter),
          "Invalid workspace input Transport",
        );
        return { snapshot: input.snapshot, transporter };
      }),
    );
    zones.set(key, {
      key,
      resource: recipeZoneResource(key),
      declaration,
      ...(retention ? { retention } : {}),
      inputs,
      baselines: [],
      workspace: undefined,
      context: undefined,
    });
  }
  return zones;
}

/** Captures publication baselines of the workspaces a resumed run has not recorded yet. */
export async function captureRecipeFileBaselines(
  zones: ReadonlyMap<string, RecipeFileZone>,
  session: RecipeCheckpointSession | undefined,
): Promise<void> {
  for (const zone of zones.values())
    if (!session?.resource(zone.resource))
      zone.baselines = await Promise.all(
        zone.declaration.outputs.map((output) =>
          captureWorkspaceOutputBaseline(output),
        ),
      );
}

function isProvider(value: unknown): value is SandboxProvider {
  return nativeRecipeGuards.sandboxProvider!(value);
}

/** Resolves the provider a sandbox key names and checks it can open a file workspace. */
export async function recipeFileProvider(
  scope: RecipeComponentScope,
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

/** File workspaces of a run: published once the workflow is done, recorded in its checkpoint. */
export function createRecipeFileZones(
  options: RecipeFileZonesOptions,
): RecipeZoneKind<FileSandbox> {
  const { zones: fileZones, runtime, scope, variables, signal } = options;
  const { session, recoveries } = options;
  const zones = createRecipeZoneSandboxes<RecipeFileZone, FileSandbox>({
    async workspace(target) {
      const zone = fileZones.get(target.workspace);
      invariant(zone, `Unknown recipe workspace: ${target.workspace}`);
      const source = zone.declaration.source;
      invariant(source, "Recipe task requires a workspace source");
      const provider = await recipeFileProvider(scope, target.sandbox, source);
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
            runtime,
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
          sandboxProvider: await recipeFileProvider(
            scope,
            target.sandbox,
            workspace.source,
          ),
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
  const publications = new Map<string, WorkspacePublication[]>();
  const records = new Map<string, FileWorkspaceRecord | undefined>();
  const detach = () => {
    for (const zone of fileZones.values()) zone.context = undefined;
  };
  let closing: Promise<void> | undefined;
  async function close(complete: boolean): Promise<void> {
    detach();
    await runCleanup(
      [
        () => zones.release(),
        ...opened().map(([, zone]) => async () => {
          if (zone.workspace && !fileWorkspaces.get(zone.workspace)?.active)
            await zone.workspace.close({ preserve: !complete });
        }),
      ],
      [],
      { message: "Recipe workspace cleanup failed" },
    );
    for (const zone of fileZones.values()) {
      const record = zone.workspace
        ? fileWorkspaces.get(zone.workspace)?.record
        : session?.resource(zone.resource)?.fileRecord;
      records.set(zone.key, record);
      if (zone.workspace && complete)
        await session?.saveResource(zone.resource, {
          state: "closed",
          ...(record ? { fileRecord: record } : {}),
        });
    }
  }
  return {
    acquire(zone, context) {
      const state = fileZones.get(zone.workspace);
      if (state) state.context = context;
      return zones.acquire(zone, context);
    },
    async release() {
      detach();
      await zones.release();
    },
    async settle(result) {
      detach();
      if (result.status !== "done") return;
      for (const [key, zone] of fileZones) {
        const saved = session?.resource(zone.resource);
        if (zones.workspaces.has(key) || saved?.state === "closed") continue;
        if (!saved?.fileRecord) continue;
        await restore(zone, saved.fileRecord);
        settled.set(key, zone);
      }
      for (const [key, zone] of opened()) {
        const published: WorkspacePublication[] = [];
        publications.set(key, published);
        for (const output of zone.declaration.outputs)
          published.push(
            await publishWorkspaceOutputs(zone.workspace!, output),
          );
      }
    },
    close(complete) {
      closing ??= close(complete);
      return closing;
    },
    reports() {
      const reported = new Set(opened().map(([key]) => key));
      if (fileZones.has("workspace")) reported.add("workspace");
      return new Map(
        [...reported].map((key) => {
          const record = records.get(key);
          return [
            key,
            {
              kind: "files" as const,
              ...(record ? { workspaceInfo: record } : {}),
              fileOutputs: publications.get(key) ?? [],
            },
          ];
        }),
      );
    },
  };

  async function restore(
    zone: RecipeFileZone,
    record: FileWorkspaceRecord,
    provider?: SandboxProvider,
  ) {
    const recovery = recoveries?.[zone.resource];
    zone.workspace = await restoreManagedFileWorkspace(
      record,
      {
        runtime,
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

/** Checks before anything opens that the agents of tasks in file workspaces can work there. */
export async function validateRecipeFileAgents(
  project: RecipeProject,
  agents: Readonly<Record<string, DispatchAgent>>,
): Promise<void> {
  const { tasks } = recipeFileTasks(project.document, project.model);
  for (const role of new Set(
    tasks.flatMap((task) => (task.agent ? [task.agent] : [])),
  )) {
    const agent = agents[role];
    invariant(agent, `Missing recipe agent: ${role}`);
    for (const candidate of dispatchCandidates(agent))
      await validateFileAgent(candidate);
  }
}

/** Checks each dispatch of a task whose sandbox opens a file workspace. */
export function recipeFileDispatchCheck(
  model: RecipeProject["model"],
): NonNullable<RecipeExecutionBindings["validateDispatch"]> {
  return async (request, sandbox) => {
    const zone = recipeSandboxZone(sandbox, model.sandboxes);
    if (recipeWorkspaceKind(model, zone.workspace) !== "files") return;
    for (const agent of dispatchCandidates(request.agent))
      await validateFileAgent(agent, request);
  };
}

/** Checks recovery authorizations before they reopen any workspace. */
export function validateRecipeWorkspaceRecoveries(
  recoveries: RecipeResumeOptions["workspaceRecovery"],
): void {
  if (!recoveries) return;
  validateJsonSchema(workspaceRecoverySchema, recoveries, "workspace recovery");
  for (const recovery of Object.values(recoveries)) {
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
  }
}
