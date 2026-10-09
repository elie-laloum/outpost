import type { Workspace, Sandbox, SandboxOptions } from "../outpost.types.ts";
import type { RecipeReport } from "../recipe-report.types.ts";
import type {
  TaskContext,
  WorkflowResult,
} from "../../domain/workflow.types.ts";
import type { RecipeGitIsolatedSettings } from "./workflow-components.types.ts";

export interface RecipeDurableWorkspace {
  readonly workspace: Workspace;
  readonly options: SandboxOptions;
}

export interface RecipeDurableResources {
  shared(context: TaskContext): Promise<Sandbox>;
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
}
