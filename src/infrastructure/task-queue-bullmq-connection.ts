import type { BullMQTaskQueueOptions } from "./task-queue-bullmq.types.ts";
import type { BullMQConnection } from "./task-queue-bullmq-connection.types.ts";
import {
  bullMQConnectionTimeoutMs,
  bullMQConnectionRetries,
  bullMQRetryDelayMs,
  bullMQMaxRetryDelayMs,
} from "./task-queue-bullmq.constants.ts";

export function createBullMQConnection(
  options: BullMQTaskQueueOptions["connection"],
): BullMQConnection {
  let ready = false;
  let closed = false;
  const retry =
    options.retryStrategy === undefined
      ? (attempt: number) => {
          if (!ready && attempt > bullMQConnectionRetries) return null;
          return Math.min(attempt * bullMQRetryDelayMs, bullMQMaxRetryDelayMs);
        }
      : options.retryStrategy;
  return {
    options: {
      connectTimeout: bullMQConnectionTimeoutMs,
      commandTimeout: bullMQConnectionTimeoutMs,
      ...options,
      retryStrategy: (attempt: number) => {
        if (closed || !retry) return null;
        return retry(attempt);
      },
      maxRetriesPerRequest: 1,
    },
    connected() {
      ready = true;
    },
    close() {
      closed = true;
    },
  };
}
