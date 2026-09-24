import type { TaskContext, TaskOptions } from "../domain/workflow.types.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import type { TaskQueue } from "../domain/task-queue.types.ts";
export type QueuedTaskOptions<T> = Omit<TaskOptions<T>, "perform"> & {
  readonly queue: TaskQueue;
  readonly handler: string;
  readonly input: (context: TaskContext) => WorkflowJson;
  readonly decode: (value: WorkflowJson) => T;
  readonly deadline?: number;
  readonly pollMs?: number;
};
