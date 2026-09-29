import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import type { WorkflowCheckpointStore } from "../domain/workflow/checkpoint.types.ts";
import type { Workflow, WorkflowOptions } from "../domain/workflow.types.ts";
import type { QueueHandlerContext } from "./queue-worker.types.ts";

export interface WorkflowJobContext extends QueueHandlerContext {
  readonly runId: string;
}

export interface WorkflowJobCheckpoint {
  readonly store: WorkflowCheckpointStore;
  /** Combined with a digest of the job input to form the checkpoint version. */
  readonly version: string;
  /** Explicitly authorize replay of incomplete tasks and their side effects. */
  readonly resume?: "retry-incomplete";
}

export type WorkflowJobStartOptions = Omit<
  WorkflowOptions,
  "checkpoint" | "signal" | "decisions" | "answers"
>;

export interface WorkflowJobOptions {
  /** Builds the workflow for one job input; the same input must build the same workflow. */
  workflow(
    input: WorkflowJson,
    context: WorkflowJobContext,
  ): Workflow | Promise<Workflow>;
  readonly checkpoint: WorkflowJobCheckpoint;
  readonly start?: WorkflowJobStartOptions;
}
