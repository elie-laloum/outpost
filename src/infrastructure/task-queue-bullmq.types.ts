import type { RedisOptions, Job, Queue, Worker } from "bullmq";
import type {
  TaskQueue,
  QueueRequest,
  QueueResult,
} from "../domain/task-queue.types.ts";

export interface BullMQTaskQueueOptions {
  readonly name: string;
  readonly connection: RedisOptions;
  readonly prefix?: string;
  readonly stalledIntervalMs?: number;
  readonly onError?: (error: Error) => void;
}
export interface BullMQTaskQueue extends TaskQueue {
  close(): Promise<void>;
}
export interface BullMQHandlerQueue {
  readonly queue: Queue<QueueRequest, QueueResult>;
  readonly worker: Worker<QueueRequest, QueueResult>;
}
export type BullMQJob = Job<QueueRequest, QueueResult>;
