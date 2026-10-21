import type { TaskRecord, TaskStatus } from "../workflow.types.ts";
import type { TaskInteractionRecord } from "./input.types.ts";
import type { WorkflowQuotaPause } from "./quota-pause.types.ts";
import type {
  WorkflowDecisionRecord,
  WorkflowPauseRequest,
} from "./gates.types.ts";

export function startTask(state: TaskRecord, now: string): void {
  state.status = "active";
  delete state.error;
  delete state.finishedAt;
  delete state.cacheHit;
  state.startedAt = now;
}

export function startTaskAttempt(state: TaskRecord, attempt: number): void {
  state.attempts = attempt;
}

export function recordTaskCacheHit(state: TaskRecord): void {
  state.cacheHit = true;
}

export function recordTaskFailure(state: TaskRecord, error: unknown): void {
  state.error = error instanceof Error ? error.message : String(error);
}

export function recordTaskInteraction(
  state: TaskRecord,
  interaction: TaskInteractionRecord,
): void {
  state.interaction = interaction;
}

/** An accepted answer reopens the task so the next run resumes its attempt. */
export function answerTaskInput(
  state: TaskRecord,
  interaction: TaskInteractionRecord,
): void {
  state.interaction = interaction;
  state.status = "waiting";
  delete state.finishedAt;
}

export function pauseTaskForQuota(
  state: TaskRecord,
  pause: WorkflowQuotaPause,
): void {
  state.quota = Object.freeze(pause);
}

export function releaseTaskQuota(state: TaskRecord): void {
  delete state.quota;
}

export function pauseTaskAtGate(
  state: TaskRecord,
  pause: WorkflowPauseRequest,
): void {
  state.pause = Object.freeze(pause);
}

export function decideTask(
  state: TaskRecord,
  decision: WorkflowDecisionRecord,
  rejection?: string,
): void {
  state.decision = decision;
  if (rejection !== undefined) state.error = rejection;
}

export function resumeTask(state: TaskRecord): void {
  state.status = "active";
  delete state.finishedAt;
}

export function finishTask(
  state: TaskRecord,
  status: TaskStatus,
  now: string,
): void {
  state.status = status;
  state.finishedAt = now;
}

export function restoredTaskStatus(
  state: TaskRecord,
  complete: boolean,
  settledPause: boolean,
): TaskStatus {
  if (
    ["done", "paused", "rejected", "waiting-input"].includes(state.status) ||
    complete ||
    (settledPause && state.status === "skipped")
  )
    return state.status;
  return "waiting";
}
