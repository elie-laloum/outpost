import { Queue, Worker } from "bullmq";
import { queueNumber, queueString } from "../domain/task-queue.ts";
import type { QueueRequest, QueueResult } from "../domain/task-queue.types.ts";
import type {
  BullMQTaskQueueOptions,
  BullMQHandlerQueue,
} from "./task-queue-bullmq.types.ts";
import { bullMQKey } from "./task-queue-bullmq-state.ts";
import {
  bullMQConnectionTimeoutMs,
  bullMQConnectionRetries,
  bullMQRetryDelayMs,
  bullMQDefaultPrefix,
  bullMQDefaultStalledIntervalMs,
} from "./task-queue-bullmq.constants.ts";

export async function openBullMQResources(options: BullMQTaskQueueOptions) {
  const name = bullMQKey(queueString(options.name));
  const prefix = queueString(options.prefix ?? bullMQDefaultPrefix);
  const stalledInterval = queueNumber(
    options.stalledIntervalMs ?? bullMQDefaultStalledIntervalMs,
  );
  if (!stalledInterval)
    throw new Error("BullMQ stalled interval must be positive");
  if (options.connection.keyPrefix)
    throw new Error(
      "Use the BullMQ queue prefix instead of connection.keyPrefix",
    );
  const connection = {
    connectTimeout: bullMQConnectionTimeoutMs,
    commandTimeout: bullMQConnectionTimeoutMs,
    retryStrategy: (attempt: number) =>
      attempt <= bullMQConnectionRetries ? attempt * bullMQRetryDelayMs : null,
    ...options.connection,
    maxRetriesPerRequest: 1,
  };
  const root = new Queue<QueueRequest, QueueResult>(name, {
    connection,
    prefix,
  });
  const handlers = new Map<string, Promise<BullMQHandlerQueue>>();
  const pending = new Set<Promise<unknown>>();
  let closing: Promise<void> | undefined;
  function report(error: unknown) {
    try {
      options.onError?.(
        error instanceof Error ? error : new Error(String(error)),
      );
    } catch {}
  }
  root.on("error", report);
  try {
    await root.waitUntilReady();
  } catch (error) {
    await root.close();
    throw error;
  }
  function nativeName(handler: string) {
    return `${name}-${bullMQKey(handler)}`;
  }
  function nativeKey(handler: string, id: string) {
    return `${prefix}:${nativeName(handler)}:${bullMQKey(id)}`;
  }
  function handlerQueue(handler: string) {
    const existing = handlers.get(handler);
    if (existing) return existing;
    const created = (async () => {
      const queue = new Queue<QueueRequest, QueueResult>(nativeName(handler), {
        connection,
        prefix,
      });
      const worker = new Worker<QueueRequest, QueueResult>(
        nativeName(handler),
        null,
        {
          connection: { ...connection, maxRetriesPerRequest: null },
          prefix,
          autorun: false,
          skipLockRenewal: true,
          stalledInterval,
          maxStalledCount: Number.MAX_SAFE_INTEGER,
        },
      );
      queue.on("error", report);
      worker.on("error", report);
      try {
        await Promise.all([queue.waitUntilReady(), worker.waitUntilReady()]);
        await worker.startStalledCheckTimer();
        return { queue, worker };
      } catch (error) {
        await Promise.all([queue.close(), worker.close(true)]);
        throw error;
      }
    })();
    handlers.set(handler, created);
    void created.catch(() => {
      if (handlers.get(handler) === created) handlers.delete(handler);
    });
    return created;
  }
  function perform<T>(operation: () => Promise<T>): Promise<T> {
    if (closing)
      return Promise.reject(new Error("BullMQ task queue is closed"));
    const promise = operation();
    pending.add(promise);
    void promise.then(
      () => pending.delete(promise),
      () => pending.delete(promise),
    );
    return promise;
  }
  return {
    root,
    prefix,
    nativeName,
    nativeKey,
    handlerQueue,
    perform,
    report,
    close() {
      closing ??= (async () => {
        await Promise.allSettled([...pending]);
        const opened = await Promise.allSettled([...handlers.values()]);
        const resources = opened.flatMap((entry) =>
          entry.status === "fulfilled"
            ? [entry.value.worker, entry.value.queue]
            : [],
        );
        const results = await Promise.allSettled(
          resources.map((resource) => resource.close()),
        );
        await root.close();
        const errors = results
          .filter((entry) => entry.status === "rejected")
          .map((entry) => entry.reason);
        if (errors.length)
          throw new AggregateError(errors, "Failed to close BullMQ task queue");
      })();
      return closing;
    },
  };
}
