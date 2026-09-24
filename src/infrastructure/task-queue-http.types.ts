import type { TaskQueue } from "../domain/task-queue.types.ts";
export interface QueueServerOptions {
  readonly queue: TaskQueue;
  readonly token: string;
  readonly host?: string;
  readonly port?: number;
}
export interface QueueServer {
  readonly url: string;
  close(): Promise<void>;
}
export interface QueueClientOptions {
  readonly url: string;
  readonly token: string;
  readonly timeoutMs?: number;
}
