import { setTimeout as delay } from "node:timers/promises";
import { queueNumber } from "../domain/task-queue.ts";
import { triggerQueueRequest } from "../domain/trigger-job.ts";
import { triggerNamePattern } from "../domain/trigger-job.constants.ts";
import {
  scheduleDefaultMaxLateMs,
  scheduleMaxTimerMs,
} from "./schedules.constants.ts";
import type {
  RunSchedulesOptions,
  ScheduleClock,
  TriggerSchedule,
} from "./schedules.types.ts";

const systemClock: ScheduleClock = {
  now: () => Date.now(),
  sleep: (ms, signal) =>
    delay(Math.min(ms, scheduleMaxTimerMs), undefined, { signal }),
};

function validSchedules(
  schedules: readonly TriggerSchedule[],
): readonly TriggerSchedule[] {
  if (!Array.isArray(schedules) || !schedules.length)
    throw new Error("runSchedules() requires at least one schedule");
  const names = new Set<string>();
  for (const schedule of schedules) {
    if (!triggerNamePattern.test(schedule.name) || names.has(schedule.name))
      throw new Error(`Invalid or duplicate schedule name: ${schedule.name}`);
    if (
      typeof schedule.cron?.next !== "function" ||
      typeof schedule.cron.previous !== "function"
    )
      throw new Error(`Schedule ${schedule.name} requires cronSchedule()`);
    if (typeof schedule.handler !== "string" || !schedule.handler)
      throw new Error(`Schedule ${schedule.name} requires a handler`);
    names.add(schedule.name);
  }
  return [...schedules];
}

/** Test seam: `runSchedules()` with an injected clock. */
export async function runSchedulesWithClock(
  options: RunSchedulesOptions,
  clock: ScheduleClock,
): Promise<void> {
  const schedules = validSchedules(options.schedules);
  const maxLateMs = queueNumber(options.maxLateMs ?? scheduleDefaultMaxLateMs);
  const stop = new AbortController();
  const signal = AbortSignal.any([options.signal, stop.signal]);
  async function publish(schedule: TriggerSchedule, slot: Date) {
    const iso = slot.toISOString();
    try {
      await options.queue.enqueue(
        triggerQueueRequest(`schedule:${schedule.name}:${iso}`, {
          handler: schedule.handler,
          runId: schedule.runId?.(slot) ?? `${schedule.name}:${iso}`,
          input: schedule.input?.(slot) ?? null,
        }),
      );
    } catch (error) {
      if (!options.onError) throw error;
      try {
        options.onError(error, { schedule: schedule.name, slot });
      } catch {
        /* Observer failures must not stop the scheduler. */
      }
    }
  }
  async function run(schedule: TriggerSchedule) {
    let cursor = clock.now() - maxLateMs;
    while (!signal.aborted) {
      const slot = schedule.cron.next(new Date(cursor)).getTime();
      for (let wait = slot - clock.now(); wait > 0; wait = slot - clock.now())
        await clock.sleep(wait, signal);
      const now = clock.now();
      const latest = schedule.cron.previous(new Date(now));
      if (now - latest.getTime() <= maxLateMs) await publish(schedule, latest);
      cursor = latest.getTime();
    }
  }
  try {
    await Promise.all(
      schedules.map((schedule) =>
        run(schedule).catch((error: unknown) => {
          stop.abort();
          throw error;
        }),
      ),
    );
  } catch (error) {
    if (!options.signal.aborted) throw error;
  }
}

/** Publish one trigger job per cron slot until the signal aborts. */
export function runSchedules(options: RunSchedulesOptions): Promise<void> {
  return runSchedulesWithClock(options, systemClock);
}
