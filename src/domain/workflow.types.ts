import type {
  WorkflowDecision,
  WorkflowDecisionRecord,
  WorkflowGate,
  WorkflowPauseRequest,
} from "./workflow/gates.types.ts";
import type { WorkflowCheckpointOptions } from "./workflow/checkpoint.types.ts";
import type { Usage } from "./agent.types.ts";
import type {
  WorkflowAccounting,
  WorkflowBudget,
  WorkflowUsage,
} from "./workflow/budget.types.ts";

export interface TaskContext {
  readonly signal: AbortSignal;
  readonly attempt: number;
  readonly executionId: string;
  reportUsage(usage: Usage): void;
  reportUsageOnce?(receipt: string, usage: Usage): void;
  checkpoint?(): Promise<void>;
  value<T>(dependency: Task<T>): T;
}

export interface Retry {
  readonly attempts: number;
  readonly delayMs?: number;
  readonly accepts?: (error: unknown, attempt: number) => boolean;
}

export interface Task<T = unknown> {
  readonly key: string;
  readonly gate?: WorkflowGate;
  readonly after: readonly Task[];
  readonly perform: (context: TaskContext) => T | Promise<T>;
  readonly condition?: (context: TaskContext) => boolean | Promise<boolean>;
  readonly retry?: Retry;
  readonly timeoutMs?: number;
}

export type TaskOptions<T> = Omit<Task<T>, "after"> & {
  readonly after?: readonly Task[];
};

export type TaskStatus =
  | "waiting"
  | "active"
  | "done"
  | "failed"
  | "skipped"
  | "cancelled"
  | "paused"
  | "rejected";

export interface TaskRecord {
  usageReceipts?: readonly string[];
  pause?: WorkflowPauseRequest;
  decision?: WorkflowDecisionRecord;
  readonly key: string;
  status: TaskStatus;
  attempts: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}

export interface WorkflowEvent {
  readonly executionId: string;
  readonly workflow: string;
  readonly timestamp: string;
  readonly type: "start" | "task" | "attempt" | "retry" | "usage" | "finish";
  readonly key?: string;
  readonly status?: TaskStatus;
  readonly attempt?: number;
  readonly usage?: Usage;
  readonly durationMs?: number;
}

export interface WorkflowTelemetry {
  observe(event: WorkflowEvent): void;
}

export interface WorkflowOptions {
  readonly decisions?: readonly WorkflowDecision[];
  readonly checkpoint?: WorkflowCheckpointOptions;
  readonly signal?: AbortSignal;
  readonly concurrency?: number;
  readonly budget?: WorkflowBudget;
  readonly stopOnError?: boolean;
  readonly telemetry?: WorkflowTelemetry;
  readonly observe?: (event: WorkflowEvent) => void;
}

export interface WorkflowResult {
  readonly executionId: string;
  readonly name: string;
  readonly status: "done" | "failed" | "cancelled" | "paused";
  readonly tasks: readonly Readonly<TaskRecord>[];
  readonly errors: readonly unknown[];
  readonly observerErrors: readonly unknown[];
  readonly usage: WorkflowUsage;
  value<T>(task: Task<T>): T;
  unwrap(): void;
}

export interface Workflow {
  readonly name: string;
  readonly tasks: readonly Task[];
  start(options?: WorkflowOptions): Promise<WorkflowResult>;
  diagram(): string;
}

export type WorkflowNotification = Omit<
  WorkflowEvent,
  "executionId" | "workflow" | "timestamp"
>;
export interface WorkflowExecutionState {
  readonly executionId: string;
  readonly stop: AbortController;
  readonly signal: AbortSignal;
  readonly values: Map<Task, unknown>;
  readonly records: Map<Task, TaskRecord>;
  readonly errors: unknown[];
  readonly observerErrors: unknown[];
  readonly options: WorkflowOptions;
  readonly accounting: WorkflowAccounting;
  persist(): Promise<void>;
  closeAttempt(task: Task): void;
  record(task: Task): TaskRecord;
  emit(event: WorkflowNotification): void;
  finish(task: Task, status: TaskStatus): void;
  context(task: Task, attempt: number, signal: AbortSignal): TaskContext;
}
