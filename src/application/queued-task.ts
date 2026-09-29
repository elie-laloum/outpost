import { taskIdempotencyKey } from "../domain/workflow/idempotency.ts";
import { setTimeout as delay } from "node:timers/promises";
import { OutpostError, recordRecovery } from "../domain/errors.ts";
import { defineTask } from "../domain/workflow.ts";
import { queueDefaultPollMs } from "../domain/task-queue.constants.ts";
import { queueNumber, queueString } from "../domain/task-queue.ts";
import type { Task } from "../domain/workflow.types.ts";
import type { QueuedTaskOptions } from "./queued-task.types.ts";
import type { QueueQuota } from "../domain/task-queue.types.ts";

export function defineQueuedTask<T>(options: QueuedTaskOptions<T>): Task<T> {
  const {
    queue,
    handler,
    input,
    decode,
    deadline,
    pollMs = queueDefaultPollMs,
    ...definition
  } = options;
  queueString(handler);
  if (!queueNumber(pollMs))
    throw new Error("Queue poll interval must be positive");
  if (deadline !== undefined) queueNumber(deadline);
  return defineTask({
    ...definition,
    async perform(context) {
      context.signal.throwIfAborted();
      const key = taskIdempotencyKey(context.executionId, definition.key);
      const id = context.quota ? `${key}:quota:${context.attempt}` : key;
      let job = await queue.enqueue({
        id,
        ...(context.quota ? { idempotencyKey: key } : {}),
        handler,
        input: input(context),
        ...(deadline === undefined ? {} : { deadline }),
      });
      context.observation?.emit("workflow", {
        kind: "queue",
        id,
        status: "enqueued",
      });
      try {
        while (job.status === "pending" || job.status === "active") {
          await delay(pollMs, undefined, { signal: context.signal });
          const latest = await queue.get(id);
          if (!latest) throw new Error("Queued workflow job disappeared");
          job = latest;
          context.observation?.emit("workflow", {
            kind: "queue",
            id,
            status: "polled",
          });
        }
        if (job.result?.usage) {
          if (context.reportUsageOnce)
            context.reportUsageOnce(`queue:${id}`, job.result.usage);
          else context.reportUsage(job.result.usage);
        }
        if (job.status !== "done" || !job.result)
          throw queuedFailure(job.result?.error, job.result?.quota, id);
        context.signal.throwIfAborted();
        const value = decode(job.result.value);
        context.observation?.emit("workflow", {
          kind: "queue",
          id,
          status: "completed",
        });
        return value;
      } catch (error) {
        context.observation?.emit("workflow", {
          kind: "queue",
          id,
          status: "failed",
        });
        if (context.signal.aborted) {
          const latest = await queue.get(id);
          if (latest) await queue.cancel(id, latest.fence);
        }
        throw error;
      }
    },
  });
}

function queuedFailure(
  message: string | undefined,
  quota: QueueQuota | undefined,
  job: string,
): Error {
  if (!quota) return new Error(message ?? "Queued workflow job cancelled");
  const error = new OutpostError(
    "quota",
    message ?? "Queued workflow job reached a usage limit",
    {
      job,
      ...(quota.resetAt ? { resetAt: quota.resetAt } : {}),
      ...(quota.conversation ? { conversation: quota.conversation } : {}),
    },
  );
  if (quota.conversation)
    recordRecovery(error, { conversation: quota.conversation });
  return error;
}
