import { openWorkspace } from "../workspace.ts";
import { createSandbox } from "../sandbox.ts";
import { restoreRecipeWorkspace, recipeWorkspaceRecord } from "./workspace.ts";
import type { SandboxOptions, Workspace, Sandbox } from "../outpost.types.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";
import type { RecipeCheckpointSession } from "./durable.types.ts";
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
): RecipeDurableResources {
  const open = new Map<string, RecipeDurableWorkspace>();
  let shared: Promise<Sandbox> | undefined;
  let sharedSandbox: Sandbox | undefined;
  let integration =
    session.resource("shared")?.integration ??
    session.previous?.recipe.report?.integration;
  let disposedShared = false;
  const observed = observation ? { observation } : {};
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
  async function releaseShared(): Promise<void> {
    if (disposedShared || !sharedSandbox) return;
    disposedShared = true;
    await sharedSandbox.close({ preserve: true });
  }
  const resources: RecipeDurableResources = {
    shared(context) {
      shared ??= (async () => {
        const lease = await workspace(
          "shared",
          configuration.sandbox,
          context.signal,
        );
        const sandbox = await createSandbox({
          ...sandboxOptions(configuration.sandbox, lease),
          signal: context.signal,
        });
        sharedSandbox = sandbox;
        return sandbox;
      })();
      return shared;
    },
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
      await releaseShared();
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
        const complete =
          key === "shared"
            ? result.status === "done"
            : result.tasks.some(
                (task) =>
                  `isolated.${task.key}` === key && task.status === "done",
              );
        if (!complete) continue;
        const settings =
          open.get(key)?.options ??
          (key === "shared"
            ? configuration.sandbox
            : { repository: saved.record.repository });
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
        if (key === "shared" && saved.state !== "integrated") {
          signal.throwIfAborted();
          integration =
            (await resource.workspace.integrate({
              ...configuration.integration,
              signal,
            })) ?? undefined;
        }
        await session.saveResource(key, {
          state: "integrated",
          record: saved.record,
          ...(key === "shared" && integration ? { integration } : {}),
        });
        const disposal = await resource.workspace.close();
        open.delete(key);
        await session.saveResource(key, {
          state: disposal.retainedDirectory ? "integrated" : "closed",
          record: saved.record,
          ...(key === "shared" && integration ? { integration } : {}),
        });
      }
    },
    async close() {
      const errors: unknown[] = [];
      try {
        await releaseShared();
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
    integration: () => integration,
    workspace() {
      const saved = session.resource("shared");
      if (!saved?.record) return undefined;
      return {
        branch: saved.record.branch,
        directory: saved.record.directory,
        ...(saved.state !== "closed" && saved.record.policy.mode !== "current"
          ? { retainedDirectory: saved.record.directory }
          : {}),
      };
    },
  };
  return resources;
}
