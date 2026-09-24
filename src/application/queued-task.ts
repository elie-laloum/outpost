import { createHash } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { task } from "../domain/workflow.ts";
import { queueDefaultPollMs } from "../domain/task-queue.constants.ts";
import { queueNumber, queueString } from "../domain/task-queue.ts";
import type { Task } from "../domain/workflow.types.ts";
import type { QueuedTaskOptions } from "./queued-task.types.ts";

export function queuedTask<T>(options: QueuedTaskOptions<T>): Task<T> {
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
  return task({
    ...definition,
    async perform(context) {
      context.signal.throwIfAborted();
      const id = createHash("sha256")
        .update(JSON.stringify([context.executionId, definition.key]))
        .digest("hex");
      let job = await queue.enqueue({
        id,
        handler,
        input: input(context),
        ...(deadline === undefined ? {} : { deadline }),
      });
      try {
        while (job.status === "pending" || job.status === "active") {
          await delay(pollMs, undefined, { signal: context.signal });
          const latest = await queue.get(id);
          if (!latest) throw new Error("Queued workflow job disappeared");
          job = latest;
        }
        if (job.result?.usage) {
          if (context.reportUsageOnce)
            context.reportUsageOnce(`queue:${id}`, job.result.usage);
          else context.reportUsage(job.result.usage);
        }
        if (job.status !== "done" || !job.result)
          throw new Error(job.result?.error ?? "Queued workflow job cancelled");
        context.signal.throwIfAborted();
        return decode(job.result.value);
      } catch (error) {
        if (context.signal.aborted) {
          const latest = await queue.get(id);
          if (latest) await queue.cancel(id, latest.fence);
        }
        throw error;
      }
    },
  });
}
