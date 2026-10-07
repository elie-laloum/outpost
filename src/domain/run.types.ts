import type { Usage } from "./agent.types.ts";
import type { ObservationScope, ObservationSink } from "./observation.types.ts";
import type { Transport } from "./transport.types.ts";
import type { Commit } from "./workspace.types.ts";
import type { TaskStatus, WorkflowResult } from "./workflow.types.ts";
import type { WorkflowUsage } from "./workflow/budget.types.ts";

export type RunStatus = "running" | "abandoned" | WorkflowResult["status"];
export interface RunTask {
  readonly key: string;
  readonly status: TaskStatus;
  readonly attempts: number;
  readonly usage: Usage;
  readonly startedAt?: string;
  readonly finishedAt?: string;
  readonly error?: string;
}
export interface RunPass {
  readonly pass: number;
  readonly usage: Usage;
}
export interface RunDispatch {
  readonly id: string;
  readonly taskKey?: string;
  readonly attempt?: number;
  readonly status: "running" | "done" | "failed" | "cancelled";
  readonly agent?: string;
  readonly phase?: string;
  readonly branch?: string;
  readonly completed?: boolean;
  readonly commits: readonly Commit[];
  readonly usage: Usage;
  readonly passes: readonly RunPass[];
  readonly error?: RunError;
}
export interface RunError {
  readonly code?: string;
  readonly message: string;
}
export interface RunSnapshot {
  readonly version: 1;
  readonly id: string;
  readonly kind: "dispatch" | "workflow";
  readonly executionId?: string;
  readonly workflow?: string;
  readonly status: RunStatus;
  readonly seq: number;
  readonly observationSeq: number;
  readonly complete: boolean;
  readonly startedAt: string;
  readonly updatedAt: string;
  readonly heartbeatAt: string;
  readonly expiresAt: string;
  readonly tasks: readonly RunTask[];
  readonly dispatches: readonly RunDispatch[];
  readonly commits: readonly Commit[];
  readonly usage: Usage;
  readonly accounting?: WorkflowUsage;
  readonly errors: readonly RunError[];
}
export interface RunEvent {
  readonly seq: number;
  readonly observationSeq: number;
  readonly at: string;
  readonly source: string;
  readonly scope: ObservationScope;
  readonly event: unknown;
}
export interface RunObserverOptions {
  readonly transporter: Transport;
  readonly id: string;
  readonly kind: "dispatch" | "workflow";
  readonly heartbeatMs?: number;
  readonly abandonAfterMs?: number;
  readonly resume?: boolean;
}
export interface RunObserver extends ObservationSink {
  readonly errors: readonly unknown[];
  close(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
export interface ReadRunOptions {
  readonly transporter: Transport;
  readonly id: string;
  readonly signal?: AbortSignal;
  readonly maxBytes?: number;
}
export interface WatchRunOptions extends ReadRunOptions {
  readonly from?: number;
  readonly pollMs?: number;
}
