import { openWorkspace } from "../workspace.ts";
import { createSandbox } from "../sandbox.ts";
import { restoreRecipeWorkspace, recipeWorkspaceRecord } from "./workspace.ts";
import type { SandboxOptions, Workspace, Sandbox } from "../outpost.types.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";
import type {
  RecipeCheckpointSession,
  RecipeWorkspaceCheckpoint,
} from "./durable.types.ts";
import type { WorkspaceRecord } from "../../domain/workspace.types.ts";
import type { ConflictResolution } from "../conflict-resolution.types.ts";
import type { RecipeConfigurationModel } from "./configuration-model.types.ts";
import { createRecipeZoneSandboxes } from "./zone-sandboxes.ts";
import {
  recipeSandboxZone,
  recipeWorkspaceOptions,
  recipeZoneOptions,
  recipeZoneResource,
  recipeZoneWorkspace,
} from "./zones.ts";
import type {
  RecipeDurableResources,
  RecipeDurableWorkspace,
} from "./durable-resources.types.ts";
import type { RecipeRuntimeConfiguration } from "./advanced-components.types.ts";

export function createRecipeDurableResources(
  session: RecipeCheckpointSession,
  configuration: RecipeRuntimeConfiguration,
  signal: AbortSignal,
  observation?: ObservationHub,
  sandboxes: RecipeConfigurationModel["sandboxes"] = {},
): RecipeDurableResources {
  const open = new Map<string, RecipeDurableWorkspace>();
  const integrations = new Map<string, ConflictResolution | undefined>([
    [
      "shared",
      session.resource("shared")?.integration ??
        session.previous?.recipe.report?.integration,
    ],
  ]);
  const observed = observation ? { observation } : {};
  const touched = new Set(
    Object.keys(session.previous?.recipe.resources ?? {}),
  );
  const zones = createRecipeZoneSandboxes<Workspace, Sandbox>({
    workspace(zone, context) {
      touched.add(recipeZoneResource(zone.workspace));
      return workspace(
        recipeZoneResource(zone.workspace),
        recipeZoneOptions(configuration, zone),
        context?.signal,
      );
    },
    sandbox(lease, zone, _switched, context) {
      return createSandbox({
        ...sandboxOptions(recipeZoneOptions(configuration, zone), lease),
        ...(context ? { signal: context.signal } : {}),
      });
    },
  });
  async function workspace(
    key: string,
    options: SandboxOptions,
    taskSignal = signal,
  ): Promise<Workspace> {
    if (options.workspace)
      throw new Error(
        "Durable recipes require runtime-owned workspaces; borrowed workspaces cannot be restored automatically",
      );
    if (open.has(key))
      throw new Error(`Recipe workspace already in use: ${key}`);
    const previous = session.resource(key);
    if (
      previous &&
      (!previous.record ||
        previous.state === "allocating" ||
        previous.state === "closed")
    )
      throw new Error(
        `Recipe workspace ${key} requires explicit recovery; it will not be replaced with an empty workspace`,
      );
    const settings = { ...options, ...observed, signal: taskSignal };
    if (!previous) await session.saveResource(key, { state: "allocating" });
    const restored = previous?.record
      ? await restoreRecipeWorkspace(previous.record, settings)
      : await openWorkspace(settings);
    open.set(key, { workspace: restored, options });
    try {
      await session.saveResource(key, {
        state: previous?.state ?? "ready",
        record: recipeWorkspaceRecord(restored),
      });
    } catch (error) {
      await restored.close({ preserve: true });
      open.delete(key);
      throw error;
    }
    return restored;
  }
  function sandboxOptions(
    options: SandboxOptions,
    workspace: Workspace,
  ): SandboxOptions {
    const {
      repository: _repository,
      branch: _branch,
      guard: _guard,
      copies: _copies,
      storageQuota: _quota,
      ...settings
    } = options;
    return {
      ...settings,
      workspace,
      includeUncommitted: true,
      ...observed,
      signal,
    };
  }
  const resources: RecipeDurableResources = {
    shared: (context, zone = recipeSandboxZone(undefined, {})) =>
      zones.acquire(zone, context),
    async isolated(key, request, context) {
      const lease = await workspace(`isolated.${key}`, request, context.signal);
      const {
        repository: _repository,
        branch: _branch,
        guard: _guard,
        copies: _copies,
        storageQuota: _quota,
        ...settings
      } = request;
      return {
        ...settings,
        workspace: lease,
        includeUncommitted: true,
        ...(context.observation ? { observation: context.observation } : {}),
      };
    },
    async releaseIsolated(key) {
      const name = `isolated.${key}`,
        resource = open.get(name);
      if (!resource) return;
      open.delete(name);
      await resource.workspace.close({ preserve: true });
    },
    async settle(result) {
      await zones.release();
      const keys = new Set([
        ...(session.previous
          ? Object.keys(session.previous.recipe.resources)
          : []),
        ...open.keys(),
        ...result.tasks
          .filter((task) => task.status === "done")
          .map((task) => `isolated.${task.key}`),
      ]);
      for (const key of keys) {
        const saved = session.resource(key);
        if (!saved?.record || saved.state === "closed") continue;
        const zoned = !key.startsWith("isolated.");
        const complete = zoned
          ? result.status === "done"
          : result.tasks.some(
              (task) =>
                `isolated.${task.key}` === key && task.status === "done",
            );
        if (!complete) continue;
        const settings =
          open.get(key)?.options ??
          (zoned
            ? recipeWorkspaceOptions(
                configuration,
                sandboxes,
                recipeZoneWorkspace(key),
              )
            : { repository: saved.record.repository });
        if (!settings)
          throw new Error(`Unknown persisted recipe workspace: ${key}`);
        let resource = open.get(key);
        if (!resource) {
          resource = {
            workspace: await restoreRecipeWorkspace(saved.record, {
              ...settings,
              ...observed,
              signal,
            }),
            options: settings,
          };
          open.set(key, resource);
        }
        if (zoned && saved.state !== "integrated") {
          signal.throwIfAborted();
          integrations.set(
            key,
            (await resource.workspace.integrate({
              ...configuration.integration,
              signal,
            })) ?? undefined,
          );
        }
        const integration = integrations.get(key) ?? saved.integration;
        await session.saveResource(key, {
          state: "integrated",
          record: saved.record,
          ...(zoned && integration ? { integration } : {}),
        });
        const disposal = await resource.workspace.close();
        open.delete(key);
        await session.saveResource(key, {
          state: disposal.retainedDirectory ? "integrated" : "closed",
          record: saved.record,
          ...(zoned && integration ? { integration } : {}),
        });
      }
    },
    async close() {
      const errors: unknown[] = [];
      try {
        await zones.release();
      } catch (error) {
        errors.push(error);
      }
      for (const resource of open.values()) {
        try {
          await resource.workspace.close({ preserve: true });
        } catch (error) {
          errors.push(error);
        }
      }
      open.clear();
      if (errors.length)
        throw new AggregateError(errors, "Recipe workspace cleanup failed");
    },
    integration: () => integrations.get("shared"),
    workspace() {
      const saved = session.resource("shared");
      if (!saved?.record) return undefined;
      return workspaceReport(saved, saved.record);
    },
    workspaces() {
      const reports = [...touched].flatMap((key) => {
        const saved = session.resource(key);
        if (!key.startsWith("workspaces.") || !saved?.record) return [];
        const integration = integrations.get(key) ?? saved.integration;
        return [
          [
            key.slice("workspaces.".length),
            {
              kind: "git" as const,
              ...workspaceReport(saved, saved.record),
              ...(integration ? { integration } : {}),
            },
          ] as const,
        ];
      });
      return reports.length ? Object.fromEntries(reports) : undefined;
    },
  };
  return resources;
}

function workspaceReport(
  saved: RecipeWorkspaceCheckpoint,
  record: WorkspaceRecord,
) {
  return {
    branch: record.branch,
    directory: record.directory,
    ...(saved.state !== "closed" && record.policy.mode !== "current"
      ? { retainedDirectory: record.directory }
      : {}),
  };
}
