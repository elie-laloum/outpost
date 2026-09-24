import type { Usage } from "./agent.types.ts";
import type { WorkflowJson } from "./workflow/checkpoint.types.ts";

export interface QueueRequest {
  readonly id: string;
  readonly handler: string;
  readonly input: WorkflowJson;
  readonly deadline?: number;
}
export interface QueueResult {
  readonly value: WorkflowJson;
  readonly usage?: Usage;
  readonly error?: string;
}
export interface QueueJob extends QueueRequest {
  readonly status: "pending" | "active" | "done" | "failed" | "cancelled";
  readonly fence: number;
  readonly worker?: string;
  readonly expires?: number;
  readonly result?: QueueResult;
}
export interface QueueClaim {
  readonly worker: string;
  readonly handlers: readonly string[];
  readonly leaseMs: number;
}
export interface QueueLease {
  readonly id: string;
  readonly worker: string;
  readonly fence: number;
}
export interface TaskQueue {
  enqueue(request: QueueRequest): Promise<QueueJob>;
  get(id: string): Promise<QueueJob | undefined>;
  claim(request: QueueClaim): Promise<QueueJob | undefined>;
  renew(lease: QueueLease, leaseMs: number): Promise<QueueJob>;
  complete(lease: QueueLease, result: QueueResult): Promise<QueueJob>;
  cancel(id: string, fence: number): Promise<QueueJob>;
}
export interface DurableTaskQueue extends TaskQueue {
  close(): void;
}
