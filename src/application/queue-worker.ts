import { setTimeout as delay } from "node:timers/promises";
import {
  queueMaxStringLength,
  queueDefaultLeaseMs,
  queueDefaultPollMs,
} from "../domain/task-queue.constants.ts";
import {
  queueLeaseMs,
  queueNumber,
  queueString,
  queueResult,
} from "../domain/task-queue.ts";
import type { QueueWorkerOptions } from "./queue-worker.types.ts";
import type { QueueJob, QueueResult } from "../domain/task-queue.types.ts";

export async function runQueueWorker(
  options: QueueWorkerOptions,
): Promise<void> {
  const leaseMs = queueLeaseMs(options.leaseMs ?? queueDefaultLeaseMs);
  const pollMs = queueNumber(options.pollMs ?? queueDefaultPollMs);
  if (!pollMs) throw new Error("Worker poll interval must be positive");
  const handlers = new Map(Object.entries(options.handlers));
  if (
    !handlers.size ||
    [...handlers.values()].some((handler) => typeof handler !== "function")
  )
    throw new Error("Worker requires trusted handlers");
  const worker = queueString(options.worker);
  async function execute(job: QueueJob) {
    if (options.signal.aborted) return;
    const stop = new AbortController();
    const signal = AbortSignal.any([options.signal, stop.signal]);
    const lease = { id: job.id, worker, fence: job.fence };
    const heartbeat = (async () => {
      try {
        while (!signal.aborted) {
          await delay(Math.max(10, Math.floor(leaseMs / 3)), undefined, {
            signal,
          });
          await options.queue.renew(lease, leaseMs);
        }
      } catch (error) {
        if (!signal.aborted) stop.abort(error);
      }
    })();
    try {
      const handler = handlers.get(job.handler);
      if (!handler) throw new Error("Worker handler unavailable");
      let result: QueueResult;
      try {
        result = queueResult(await handler(job.input, { signal, job }));
      } catch (error) {
        result = {
          value: null,
          error:
            (error instanceof Error ? error.message : String(error)).slice(
              0,
              queueMaxStringLength,
            ) || "Queue handler failed",
        };
      }
      if (!signal.aborted) await options.queue.complete(lease, result);
    } finally {
      stop.abort();
      await heartbeat;
    }
  }
  try {
    while (!options.signal.aborted) {
      const job = await options.queue.claim({
        worker,
        handlers: [...handlers.keys()],
        leaseMs,
      });
      if (job) {
        await execute(job);
        continue;
      }
      await delay(pollMs, undefined, { signal: options.signal });
    }
  } catch (error) {
    if (!options.signal.aborted) throw error;
  }
}
