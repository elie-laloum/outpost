import { invariant } from "../../domain/errors.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";
import type { TaskContext } from "../../domain/workflow.types.ts";
import type { FileSandbox } from "../file-sandbox.types.ts";
import type { Sandbox } from "../outpost.types.ts";
import type { RecipeReport } from "../recipe-report.types.ts";
import type { RecipeGitZoneOptions } from "./advanced-components.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import { resolveRecipeEnvironment } from "./configuration-model.ts";
import type { RecipeConfigurationModel } from "./configuration-model.types.ts";
import {
  createRecipeDurableResources,
  recipeDurableGitZones,
} from "./durable-resources.ts";
import type {
  RecipeCheckpointSession,
  RecipeResumeOptions,
} from "./durable.types.ts";
import {
  captureRecipeFileBaselines,
  createRecipeFileZones,
  prepareRecipeFileZones,
  validateRecipeFileAgents,
} from "./file-zones.ts";
import { createRecipeGitZones } from "./git-zones.ts";
import type { RecipeProject } from "./project.types.ts";
import type {
  RecipeZoneKind,
  RecipeZoneKinds,
} from "./zone-sandboxes.types.ts";
import { recipeSandboxZone, recipeWorkspaceKind } from "./zones.ts";
import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";

/** Opens the sandbox a task selects with the kind of the workspace that sandbox opens. */
export function acquireRecipeZone(
  model: Pick<
    RecipeConfigurationModel,
    "workspace" | "workspaces" | "sandboxes"
  >,
  kinds: RecipeZoneKinds,
  context: TaskContext | undefined,
  name?: string,
): Promise<Sandbox | FileSandbox> {
  const zone = recipeSandboxZone(name, model.sandboxes);
  const kind = kinds[recipeWorkspaceKind(model, zone.workspace)];
  invariant(kind, `Unknown recipe workspace: ${zone.workspace}`);
  return kind.acquire(zone, context);
}

/** Reports of the named workspaces of every kind, by name. */
export function recipeNamedZoneReports(
  kinds: RecipeZoneKinds,
): RecipeReport["workspaces"] {
  const named = Object.values(kinds)
    .flatMap((kind) => [...(kind?.reports() ?? [])])
    .filter(([key]) => key.startsWith("workspaces."))
    .sort(([left], [right]) => (left < right ? -1 : 1));
  if (!named.length) return undefined;
  return Object.fromEntries(
    named.map(([key, report]) => [key.slice("workspaces.".length), report]),
  );
}

/** Git workspaces that a file configuration declares under `workspaces`, if any. */
export function createRecipeNamedGitZones(
  options: RecipeGitZoneOptions,
  sandboxes: RecipeConfigurationModel["sandboxes"],
  signal: AbortSignal,
  session: RecipeCheckpointSession | undefined,
  observation?: ObservationHub,
): RecipeZoneKind<Sandbox> | undefined {
  if (!options.sandboxes) return undefined;
  if (!session) return createRecipeGitZones(options, signal, observation);
  return recipeDurableGitZones(
    createRecipeDurableResources(
      session,
      options,
      signal,
      observation,
      sandboxes,
    ),
  );
}

/** File workspaces that a Git configuration declares under `workspaces`, if any. */
export async function prepareRecipeNamedFileZones(
  project: RecipeProject,
  scope: RecipeComponentScope,
  agents: Readonly<Record<string, DispatchAgent>>,
  signal: AbortSignal,
  session?: RecipeCheckpointSession,
  recoveries?: RecipeResumeOptions["workspaceRecovery"],
) {
  const runtime = project.model.runtime;
  if (!runtime) return undefined;
  await validateRecipeFileAgents(project, agents);
  const zones = await prepareRecipeFileZones(project, scope);
  await captureRecipeFileBaselines(zones, session);
  const variables = resolveRecipeEnvironment(project.model.environment);
  scope.protect(Object.values(variables));
  return createRecipeFileZones({
    zones,
    runtime,
    scope,
    variables,
    signal,
    session,
    ...(recoveries ? { recoveries } : {}),
  });
}
