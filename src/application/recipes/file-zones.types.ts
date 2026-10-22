import type {
  WorkspaceInput,
  WorkspaceOutputBaseline,
  WorkspaceRetention,
  WorkspaceRuntimeOptions,
} from "../../domain/file-workspace.types.ts";
import type { TaskContext } from "../../domain/workflow.types.ts";
import type { FileWorkspace } from "../file-workspace.types.ts";
import type { RecipeFileWorkspaceDeclaration } from "./file-configuration.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import type {
  RecipeCheckpointSession,
  RecipeResumeOptions,
} from "./durable.types.ts";

/** A file workspace of the configuration, prepared before a task opens it. */
export interface RecipeFileZone {
  /** `workspace` or `workspaces.<name>`. */
  readonly key: string;
  /** Checkpoint resource that records the workspace. */
  readonly resource: string;
  readonly declaration: RecipeFileWorkspaceDeclaration;
  readonly retention?: WorkspaceRetention;
  readonly inputs: readonly WorkspaceInput[];
  /** Destination states captured before the run, when it starts afresh. */
  baselines: readonly WorkspaceOutputBaseline[];
  workspace: FileWorkspace | undefined;
  /** Task whose workspace checkpoint receives the next record. */
  context: TaskContext | undefined;
}

/** What the file workspaces of a run need to open, restore and checkpoint. */
export interface RecipeFileZonesOptions {
  readonly zones: ReadonlyMap<string, RecipeFileZone>;
  readonly runtime: WorkspaceRuntimeOptions;
  readonly scope: RecipeComponentScope;
  readonly variables: Readonly<Record<string, string>>;
  readonly signal: AbortSignal;
  readonly session?: RecipeCheckpointSession | undefined;
  /** Recovery authorizations by checkpoint resource. */
  readonly recoveries?: RecipeResumeOptions["workspaceRecovery"];
}
