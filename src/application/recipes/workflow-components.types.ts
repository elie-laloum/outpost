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
import type { IsolatedTaskRequest } from "../tasks.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type { RecipeDispatchSettings } from "./agent-components.types.ts";
import type { Sandbox } from "../outpost.types.ts";
import type { RecipeBindings } from "../recipe.types.ts";

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
export type RecipeIsolatedSettings = Omit<
  IsolatedTaskRequest<unknown>,
  "signal" | "observation"
>;
export interface RecipeCallSettings {
  readonly perform: (
    arguments_: WorkflowJson,
    context: TaskContext,
  ) => unknown | Promise<unknown>;
}
export interface RecipeWorkflowStepComponents {
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
  readonly workflow: RecipeWorkflowSettings;
  readonly steps: Readonly<Record<string, RecipeWorkflowStepComponents>>;
}
export type RecipeExecutionBindings = Omit<RecipeBindings, "sandbox"> & {
  readonly sandbox?: Sandbox | undefined;
  acquireSandbox?(context: TaskContext): Promise<Sandbox>;
  prepareIsolated?(
    key: string,
    request: RecipeIsolatedSettings,
    context: TaskContext,
  ): Promise<RecipeIsolatedSettings>;
  releaseIsolated?(key: string): Promise<void>;
};
