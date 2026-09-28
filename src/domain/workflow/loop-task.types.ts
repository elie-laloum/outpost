import type { TaskContext, TaskOptions } from "../workflow.types.ts";
import type { WorkflowCheckpointValue } from "./checkpoint.types.ts";

export type LoopCheckResult =
  { readonly done: true } | { readonly done: false; readonly feedback: string };

export interface LoopTaskContext extends TaskContext {
  readonly round: number;
  readonly phase: "attempt" | "check";
}

export interface LoopTaskOptions<T> extends Pick<
  TaskOptions<T>,
  "key" | "after" | "condition" | "timeoutMs"
> {
  readonly maxRounds: number;
  readonly attempt: (
    context: LoopTaskContext,
    feedback: string | undefined,
  ) => T | Promise<T>;
  readonly check: (
    context: LoopTaskContext,
    result: T,
  ) => LoopCheckResult | Promise<LoopCheckResult>;
}

export interface LoopRoundRecord {
  readonly round: number;
  readonly phase: "attempt" | "check" | "complete";
  readonly output?: WorkflowCheckpointValue;
  readonly check?: LoopCheckResult;
}

export interface LoopDefinition {
  readonly maxRounds: number;
  readonly attempt: (
    context: LoopTaskContext,
    feedback: string | undefined,
  ) => unknown | Promise<unknown>;
  readonly check: (
    context: LoopTaskContext,
    result: unknown,
  ) => LoopCheckResult | Promise<LoopCheckResult>;
}
