import type {
  TaskContext,
  WorkflowResult,
} from "../../domain/workflow.types.ts";
import type { RecipeWorkspaceReport } from "../recipe-report.types.ts";
import type { RecipeTaskZone, RecipeZoneKindName } from "./zones.types.ts";
import type { Sandbox } from "../outpost.types.ts";
import type { FileSandbox } from "../file-sandbox.types.ts";

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

/** The workspaces of one kind that a recipe run opens, settles and reports. */
export interface RecipeZoneKind<S> {
  acquire(zone: RecipeTaskZone, context?: TaskContext): Promise<S>;
  /** Closes the open sandboxes, preserving their work. */
  release(): Promise<void>;
  /** Integrates or publishes the workspaces a completed workflow worked in. */
  settle(result: WorkflowResult): Promise<void>;
  /** Closes the workspaces once; `complete` is true when the whole run succeeded. */
  close(complete: boolean): Promise<void>;
  /** Reports by workspace key, `workspace` or `workspaces.<name>`, once closed. */
  reports(): ReadonlyMap<string, RecipeWorkspaceReport>;
}

/** The kinds a run opens zones with, by workspace kind; a mixed configuration uses both. */
export type RecipeZoneKinds = Readonly<
  Partial<Record<RecipeZoneKindName, RecipeZoneKind<Sandbox | FileSandbox>>>
>;
