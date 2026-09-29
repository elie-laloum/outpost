import type { CronSchedule } from "../domain/cron.types.ts";
import type { TaskQueue } from "../domain/task-queue.types.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";

export interface TriggerSchedule {
  /** Stable name; part of each slot's queue job identifier. */
  readonly name: string;
  readonly cron: CronSchedule;
  readonly handler: string;
  /** Defaults to `<name>:<slot ISO time>`. */
  readonly runId?: (slot: Date) => string;
  /** Defaults to `null`. */
  readonly input?: (slot: Date) => WorkflowJson;
}

export interface ScheduleFailure {
  readonly schedule: string;
  readonly slot: Date;
}

export interface RunSchedulesOptions {
  readonly queue: TaskQueue;
  readonly schedules: readonly TriggerSchedule[];
  readonly signal: AbortSignal;
  /** Latest publication accepted for a slot, including after a restart; defaults to 60 seconds. */
  readonly maxLateMs?: number;
  /** Receives publication failures; without it, the first failure rejects `runSchedules()`. */
  readonly onError?: (error: unknown, failure: ScheduleFailure) => void;
}

export interface ScheduleClock {
  now(): number;
  sleep(ms: number, signal: AbortSignal): Promise<void>;
}
