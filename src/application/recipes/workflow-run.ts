import { runCleanup } from "../../domain/cleanup.ts";
import { recipeWorkflowReport } from "./workflow-report.ts";
import { bindRecipeWorkflow } from "./workflow.ts";
import { createSandbox } from "../sandbox.ts";
import { openWorkspace } from "../workspace.ts";
import { createRecipeZoneSandboxes } from "./zone-sandboxes.ts";
import {
  recipeSandboxZone,
  recipeZoneOptions,
  recipeZoneOrder,
} from "./zones.ts";
import type { RecipeDocument, RecipeValue } from "../../domain/recipe.types.ts";
import type { RecipeRuntimeConfiguration } from "./advanced-components.types.ts";
import type { RecipeWorkflowComponents } from "./workflow-components.types.ts";
import type {
  RecipeGitWorkspaceReport,
  RecipeReport,
} from "../recipe-report.types.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";
import type { Sandbox, Workspace } from "../outpost.types.ts";
import type { WorkflowResult } from "../../domain/workflow.types.ts";
import type { ConflictResolution } from "../conflict-resolution.types.ts";

export async function runRecipeWorkflow(
  document: RecipeDocument,
  configuration: RecipeRuntimeConfiguration,
  inputs: Readonly<Record<string, RecipeValue>>,
  components: RecipeWorkflowComponents,
  signal: AbortSignal,
  observation?: ObservationHub,
): Promise<RecipeReport> {
  const observed = observation ? { observation } : {};
  const owned = new Set<Workspace>();
  const zones = createRecipeZoneSandboxes<Workspace, Sandbox>({
    async workspace(zone) {
      const options = recipeZoneOptions(configuration, zone);
      if (options.workspace) return options.workspace;
      const workspace = await openWorkspace({
        ...options,
        signal,
        ...observed,
      });
      owned.add(workspace);
      return workspace;
    },
    sandbox(workspace, zone, switched) {
      const {
        repository: _repository,
        branch: _branch,
        guard: _guard,
        copies: _copies,
        storageQuota: _storageQuota,
        ...settings
      } = recipeZoneOptions(configuration, zone);
      // A later sandbox must see the work earlier sandboxes left in the worktree.
      return createSandbox({
        ...settings,
        ...(switched ? { includeUncommitted: true } : {}),
        workspace,
        signal,
        ...observed,
      });
    },
  });
  let result: WorkflowResult | undefined;
  const integrations = new Map<string, ConflictResolution | undefined>();
  const errors: unknown[] = [];
  const workflow = bindRecipeWorkflow(
    document,
    {
      ...(configuration.agents ? { agents: configuration.agents } : {}),
      inputs,
      acquireSandbox: (_context, name) =>
        zones.acquire(recipeSandboxZone(name, components.sandboxes ?? {})),
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
      await zones.acquire(recipeSandboxZone(undefined, {}));
    } catch (error) {
      await runCleanup(
        [...owned].map(
          (workspace) => () => workspace.close({ preserve: true }),
        ),
        [error],
        { message: "Recipe allocation and cleanup failed" },
      );
      throw error;
    }
  try {
    result = await workflow.start({
      signal,
      ...(observation ? { observation } : {}),
    });
    errors.push(...result.errors);
    await zones.release();
    if (result.status === "done")
      for (const [key, workspace] of recipeZoneOrder(zones.workspaces)) {
        signal.throwIfAborted();
        integrations.set(
          key,
          (await workspace.integrate({
            ...configuration.integration,
            signal,
          })) ?? undefined,
        );
      }
  } catch (error) {
    errors.push(error);
  }
  const reports = new Map<string, RecipeGitWorkspaceReport>();
  try {
    await zones.release();
  } catch (error) {
    errors.push(error);
  }
  for (const [key, workspace] of recipeZoneOrder(zones.workspaces)) {
    const integrated = integrations.has(key);
    const integration = integrations.get(key);
    let report: RecipeGitWorkspaceReport = {
      kind: "git",
      branch: workspace.branch,
      directory: workspace.directory,
      ...(integration ? { integration } : {}),
    };
    try {
      const disposal = owned.has(workspace)
        ? await workspace.close({ preserve: !integrated || signal.aborted })
        : {};
      report = {
        ...report,
        ...disposal,
        ...(!integrated && workspace.policy.mode !== "current"
          ? { retainedDirectory: workspace.directory }
          : {}),
      };
    } catch (error) {
      errors.push(error);
    }
    reports.set(key, report);
  }
  const main = reports.get("workspace");
  const named = [...reports].filter(([key]) => key !== "workspace");
  return {
    ...recipeWorkflowReport(
      workflow,
      result,
      errors,
      signal,
      main && {
        branch: main.branch,
        directory: main.directory,
        ...(main.retainedDirectory
          ? { retainedDirectory: main.retainedDirectory }
          : {}),
      },
    ),
    ...(main?.integration ? { integration: main.integration } : {}),
    ...(named.length
      ? {
          workspaces: Object.fromEntries(
            named.map(([key, report]) => [
              key.slice("workspaces.".length),
              report,
            ]),
          ),
        }
      : {}),
  };
}
