import type { TaskRecord, TaskStatus } from "../workflow.types.ts";

export function startTask(state: TaskRecord, now: string): void {
  state.status = "active";
  delete state.error;
  delete state.finishedAt;
  delete state.cacheHit;
  state.startedAt = now;
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
