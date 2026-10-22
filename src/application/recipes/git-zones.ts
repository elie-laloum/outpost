import { runCleanup } from "../../domain/cleanup.ts";
import { createSandbox } from "../sandbox.ts";
import { openWorkspace } from "../workspace.ts";
import { createRecipeZoneSandboxes } from "./zone-sandboxes.ts";
import { recipeZoneOptions, recipeZoneOrder } from "./zones.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";
import type { Sandbox, Workspace } from "../outpost.types.ts";
import type { ConflictResolution } from "../conflict-resolution.types.ts";
import type { RecipeGitWorkspaceReport } from "../recipe-report.types.ts";
import type { RecipeGitZoneOptions } from "./advanced-components.types.ts";
import type { RecipeZoneKind } from "./zone-sandboxes.types.ts";

/** Git workspaces of a run without checkpoint: integrated once the workflow is done, kept otherwise. */
export function createRecipeGitZones(
  configuration: RecipeGitZoneOptions,
  signal: AbortSignal,
  observation?: ObservationHub,
): RecipeZoneKind<Sandbox> {
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
  const integrations = new Map<string, ConflictResolution | undefined>();
  const reports = new Map<string, RecipeGitWorkspaceReport>();
  let closing: Promise<void> | undefined;
  async function close(): Promise<void> {
    const steps = recipeZoneOrder(zones.workspaces).map(
      ([key, workspace]) =>
        async () => {
          const integrated = integrations.has(key);
          const integration = integrations.get(key);
          const report: RecipeGitWorkspaceReport = {
            kind: "git",
            branch: workspace.branch,
            directory: workspace.directory,
            ...(integration ? { integration } : {}),
          };
          reports.set(key, report);
          const disposal = owned.has(workspace)
            ? await workspace.close({ preserve: !integrated || signal.aborted })
            : {};
          reports.set(key, {
            ...report,
            ...disposal,
            ...(!integrated && workspace.policy.mode !== "current"
              ? { retainedDirectory: workspace.directory }
              : {}),
          });
        },
    );
    await runCleanup(steps, [], { message: "Recipe workspace cleanup failed" });
  }
  return {
    acquire: (zone, context) => zones.acquire(zone, context),
    release: () => zones.release(),
    async settle(result) {
      if (result.status !== "done") return;
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
    },
    close() {
      closing ??= close();
      return closing;
    },
    reports: () => reports,
  };
}
