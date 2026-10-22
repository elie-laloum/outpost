import type { Workspace, Sandbox, SandboxOptions } from "../outpost.types.ts";
import type { RecipeReport } from "../recipe-report.types.ts";
import type {
  TaskContext,
  WorkflowResult,
} from "../../domain/workflow.types.ts";
import type { RecipeGitIsolatedSettings } from "./workflow-components.types.ts";
import type { RecipeTaskZone } from "./zones.types.ts";

export interface RecipeDurableWorkspace {
  readonly workspace: Workspace;
  readonly options: SandboxOptions;
}

export interface RecipeDurableResources {
  /** Sandbox of a zone; the configuration sandbox when `zone` is absent. */
  shared(context: TaskContext, zone?: RecipeTaskZone): Promise<Sandbox>;
  /** Closes the open zone sandboxes, preserving their work. */
  release(): Promise<void>;
  isolated(
    key: string,
    request: RecipeGitIsolatedSettings,
    context: TaskContext,
  ): Promise<RecipeGitIsolatedSettings>;
  releaseIsolated(key: string): Promise<void>;
  settle(result: WorkflowResult): Promise<void>;
  close(): Promise<void>;
  integration(): RecipeReport["integration"];
  workspace(): RecipeReport["workspace"];
  workspaces(): RecipeReport["workspaces"];
}
