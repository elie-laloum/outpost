import type {
  TaskInteraction,
  TaskInteractionContext,
  TaskInteractionRecord,
  WorkflowAnswer,
  WorkflowInputRequest,
} from "./workflow/input.types.ts";
import type { LoopRoundRecord } from "./workflow/loop-task.types.ts";
import type {
  WorkflowQuotaPause,
  WorkflowQuotaPolicy,
} from "./workflow/quota-pause.types.ts";
import type { ObservationHub } from "./observation.types.ts";
import type {
  WorkflowDecision,
  WorkflowDecisionVerifier,
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
  readonly interaction?: TaskInteractionContext;
  readonly idempotencyKey: string;
  readonly observation?: ObservationHub;
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
  readonly backoff?: "fixed" | "exponential";
  readonly maxDelayMs?: number;
  readonly jitter?: "none" | "full";
  readonly accepts?: (error: unknown, attempt: number) => boolean;
}

export interface Task<T = unknown> {
  readonly interaction?: TaskInteraction;
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
  | "waiting-input"
  | "waiting"
  | "active"
  | "done"
  | "failed"
  | "skipped"
  | "cancelled"
  | "paused"
  | "rejected";

export interface TaskRecord {
  quota?: WorkflowQuotaPause;
  interaction?: TaskInteractionRecord;
  rounds?: readonly LoopRoundRecord[];
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
  readonly type:
    | "quota"
    | "input-request"
    | "input-answer"
    | "loop"
    | "start"
    | "task"
    | "attempt"
    | "retry"
    | "usage"
    | "finish"
    | "gate"
    | "decision"
    | "checkpoint"
    | "resume"
    | "budget-exceeded";
  readonly resetAt?: string;
  readonly round?: number;
  readonly phase?: "attempt" | "check" | "complete";
  readonly key?: string;
  readonly status?: TaskStatus;
  readonly attempt?: number;
  readonly usage?: Usage;
  readonly durationMs?: number;
  readonly delayMs?: number;
}

export interface WorkflowTelemetry {
  observe(event: WorkflowEvent): void;
}

export interface WorkflowOptions {
  readonly onQuota?: WorkflowQuotaPolicy;
  readonly answers?: readonly WorkflowAnswer[];
  readonly timeoutMs?: number;
  readonly observation?: ObservationHub;
  readonly decisionVerifier?: WorkflowDecisionVerifier;
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
  readonly inputRequests: readonly WorkflowInputRequest[];
  readonly executionId: string;
  readonly name: string;
  readonly status: "done" | "failed" | "cancelled" | "paused" | "waiting-input";
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
  readonly observation: ObservationHub;
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
