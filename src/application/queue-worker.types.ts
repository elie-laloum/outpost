import type {
  QueueJob,
  QueueResult,
  TaskQueue,
} from "../domain/task-queue.types.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
export interface QueueHandlerContext {
  readonly signal: AbortSignal;
  readonly job: QueueJob;
}
export type QueueHandler = (
  input: WorkflowJson,
  context: QueueHandlerContext,
) => Promise<QueueResult> | QueueResult;
export interface QueueWorkerOptions {
  readonly queue: TaskQueue;
  readonly worker: string;
  readonly handlers: Readonly<Record<string, QueueHandler>>;
  readonly signal: AbortSignal;
  readonly leaseMs?: number;
  readonly pollMs?: number;
}
