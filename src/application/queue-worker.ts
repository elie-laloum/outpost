import { setTimeout as delay } from "node:timers/promises";
import {
  queueMaxStringLength,
  queueDefaultLeaseMs,
  queueDefaultPollMs,
} from "../domain/task-queue.constants.ts";
import {
  queueLeaseMs,
  queueNumber,
  queueClaim,
  queueResult,
} from "../domain/task-queue.ts";
import type { QueueWorkerOptions } from "./queue-worker.types.ts";
import type { QueueJob, QueueResult } from "../domain/task-queue.types.ts";
import { recoveryDetails } from "../domain/errors.ts";
import { quotaFault } from "../domain/quota.ts";

export async function runQueueWorker(
  options: QueueWorkerOptions,
): Promise<void> {
  const leaseMs = queueLeaseMs(options.leaseMs ?? queueDefaultLeaseMs);
  const pollMs = queueNumber(options.pollMs ?? queueDefaultPollMs);
  if (!pollMs) throw new Error("Worker poll interval must be positive");
  if (options.onError !== undefined && typeof options.onError !== "function")
    throw new Error("Worker onError must be a function");
  const handlers = new Map(Object.entries(options.handlers));
  if (
    !handlers.size ||
    [...handlers.values()].some((handler) => typeof handler !== "function")
  )
    throw new Error("Worker requires trusted handlers");
  const claim = queueClaim({
    worker: options.worker,
    handlers: [...handlers.keys()],
    leaseMs,
  });
  const worker = claim.worker;
  function report(error: unknown) {
    try {
      options.onError?.(error);
    } catch {}
  }
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
        if (!signal.aborted) {
          report(error);
          stop.abort(error);
        }
      }
    })();
    try {
      const handler = handlers.get(job.handler);
      if (!handler) throw new Error("Worker handler unavailable");
      let result: QueueResult;
      try {
        result = queueResult(
          await handler(job.input, {
            signal,
            job,
            idempotencyKey: job.idempotencyKey ?? job.id,
          }),
        );
      } catch (error) {
        const quota = quotaFault(error);
        const captured =
          typeof recoveryDetails(error)?.transcript === "string" &&
          quota?.conversation !== undefined &&
          quota.conversation.length <= queueMaxStringLength;
        result = {
          value: null,
          error:
            (error instanceof Error ? error.message : String(error)).slice(
              0,
              queueMaxStringLength,
            ) || "Queue handler failed",
          ...(quota
            ? {
                quota: {
                  ...(quota.resetAt ? { resetAt: quota.resetAt } : {}),
                  ...(captured ? { conversation: quota.conversation } : {}),
                },
              }
            : {}),
        };
      }
      while (!signal.aborted) {
        try {
          await options.queue.complete(lease, result);
          return;
        } catch (error) {
          report(error);
          try {
            const current = await options.queue.get(job.id);
            if (
              !current ||
              current.status !== "active" ||
              current.worker !== worker ||
              current.fence !== job.fence ||
              (current.expires ?? 0) <= Date.now()
            )
              return;
          } catch (error) {
            report(error);
          }
          await delay(pollMs, undefined, { signal });
        }
      }
    } catch (error) {
      if (!signal.aborted) throw error;
    } finally {
      stop.abort();
      await heartbeat;
    }
  }
  try {
    while (!options.signal.aborted) {
      let job: QueueJob | undefined;
      try {
        job = await options.queue.claim(claim);
      } catch (error) {
        if (!options.signal.aborted) report(error);
      }
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
