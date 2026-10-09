import type { RecipeSpeculationSettings } from "./advanced-components.types.ts";
import type { RecipeQueuedSettings } from "./service-components.types.ts";
import type {
  RecipeGateSettings,
  RecipeInteractiveSettings,
  RecipeArtifactSettings,
} from "./storage-components.types.ts";
import type {
  TaskContext,
  TaskOptions,
  WorkflowOptions,
} from "../../domain/workflow.types.ts";
import type { LoopTaskOptions } from "../../domain/workflow/loop-task.types.ts";
import type { DecideOptions } from "../../domain/decision.types.ts";
import type {
  IsolatedTaskRequest,
  FileIsolatedCommandRequest,
} from "../tasks.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type { RecipeDispatchSettings } from "./agent-components.types.ts";
import type { Sandbox, SandboxOptions } from "../outpost.types.ts";
import type { RecipeBindings } from "../recipe.types.ts";
import type { FileSandbox } from "../file-sandbox.types.ts";
import type { FileDispatchRequest } from "../file-sandbox.types.ts";

export type RecipeTaskSettings = Omit<
  TaskOptions<unknown>,
  "key" | "after" | "perform"
>;
export type RecipeWorkflowSettings = Omit<
  WorkflowOptions,
  "signal" | "observation"
>;
export type RecipeLoopSettings = Pick<
  LoopTaskOptions<unknown>,
  "maxRounds" | "attempt" | "check"
>;
export type RecipeDecisionSettings = Omit<
  DecideOptions,
  "state" | "signal" | "observation"
>;
export type RecipeGitIsolatedSettings = Omit<
  IsolatedTaskRequest<unknown>,
  "signal" | "observation"
>;
export type RecipeFileIsolatedSettings = FileDispatchRequest<unknown>;
export type RecipeIsolatedSettings =
  | RecipeGitIsolatedSettings
  | RecipeFileIsolatedSettings
  | FileIsolatedCommandRequest;
export interface RecipeCallSettings {
  readonly perform: (
    arguments_: WorkflowJson,
    context: TaskContext,
  ) => unknown | Promise<unknown>;
}
export interface RecipeWorkflowStepComponents {
  readonly speculation?: RecipeSpeculationSettings;
  readonly queued?: RecipeQueuedSettings;
  readonly gate?: RecipeGateSettings;
  readonly interactive?: RecipeInteractiveSettings;
  readonly artifact?: RecipeArtifactSettings;
  readonly options?: RecipeTaskSettings;
  readonly dispatch?: RecipeDispatchSettings;
  readonly loop?: RecipeLoopSettings;
  readonly decision?: RecipeDecisionSettings;
  readonly isolated?: RecipeIsolatedSettings;
  readonly call?: RecipeCallSettings;
}
export interface RecipeWorkflowComponents {
  readonly identity?: string;
  readonly retryIncomplete?: boolean;
  readonly sharedSandbox?: SandboxOptions;
  readonly workflow: RecipeWorkflowSettings;
  readonly steps: Readonly<Record<string, RecipeWorkflowStepComponents>>;
}
export type RecipeExecutionBindings = Omit<RecipeBindings, "sandbox"> & {
  validateDispatch?(
    request: import("../execution.types.ts").DispatchOptions<unknown> & {
      readonly agent: import("../../domain/fallback-agent.types.ts").DispatchAgent;
    },
  ): Promise<void>;
  readonly sandbox?: Sandbox | FileSandbox | undefined;
  acquireSandbox?(context: TaskContext): Promise<Sandbox | FileSandbox>;
  prepareIsolated?(
    key: string,
    request: RecipeIsolatedSettings,
    context: TaskContext,
  ): Promise<RecipeIsolatedSettings>;
  releaseIsolated?(key: string): Promise<void>;
};
