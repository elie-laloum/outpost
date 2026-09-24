import type { TaskRecord, WorkflowExecutionState } from "../workflow.types.ts";
import type { WorkflowUsage } from "./budget.types.ts";

export type WorkflowJson =
  | null
  | boolean
  | number
  | string
  | readonly WorkflowJson[]
  | { readonly [key: string]: WorkflowJson };
export type WorkflowCheckpointValue =
  | { readonly kind: "undefined" }
  | { readonly kind: "json"; readonly value: WorkflowJson };

export interface WorkflowCheckpoint {
  readonly format: 1;
  readonly identity: string;
  readonly executionId: string;
  readonly records: readonly Readonly<TaskRecord>[];
  readonly values: Readonly<Record<string, WorkflowCheckpointValue>>;
  readonly usage: WorkflowUsage;
}

export interface WorkflowCheckpointLease {
  read(): Promise<unknown>;
  write(checkpoint: WorkflowCheckpoint): Promise<void>;
  release(): Promise<void>;
}

export interface WorkflowCheckpointStore {
  acquire(runId: string): Promise<WorkflowCheckpointLease>;
}

export interface WorkflowCheckpointOptions {
  readonly store: WorkflowCheckpointStore;
  readonly runId: string;
  /** Change when task implementations or workflow inputs change. */
  readonly version: string;
  /** Explicitly authorize replay of incomplete tasks and their side effects. */
  readonly resume?: "retry-incomplete";
}

export interface WorkflowCheckpointSession {
  readonly initial: WorkflowCheckpoint | undefined;
  save(state: WorkflowExecutionState): Promise<void>;
  release(): Promise<void>;
}
