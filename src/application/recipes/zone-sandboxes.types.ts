import type { TaskContext } from "../../domain/workflow.types.ts";
import type { RecipeTaskZone } from "./zones.types.ts";

export interface RecipeZoneSandbox {
  close(options?: { readonly preserve?: boolean }): Promise<unknown>;
}

/** Opens the workspaces and sandboxes of recipe zones when a task first needs them. */
export interface RecipeZoneOpener<W, S extends RecipeZoneSandbox> {
  workspace(zone: RecipeTaskZone, context?: TaskContext): Promise<W>;
  /** `switched` is true when an earlier sandbox already ran on this workspace. */
  sandbox(
    workspace: W,
    zone: RecipeTaskZone,
    switched: boolean,
    context?: TaskContext,
  ): Promise<S>;
}

export interface RecipeZoneSandboxes<W, S> {
  acquire(zone: RecipeTaskZone, context?: TaskContext): Promise<S>;
  /** Opened workspaces by configuration key, in opening order. */
  readonly workspaces: ReadonlyMap<string, W>;
  /** Closes the open sandbox of every workspace, preserving its work. */
  release(): Promise<void>;
}

/** A workspace and the sandbox currently open on it. */
export interface RecipeZoneSlot<W, S> {
  readonly workspace: W;
  current: { readonly key: string; readonly sandbox: S } | undefined;
  switched: boolean;
  queue: Promise<unknown>;
}
