import type {
  QueueClaim,
  QueueJob,
  QueueLease,
  QueueRequest,
  QueueResult,
} from "./task-queue.types.ts";
import {
  queueMaxValueBytes,
  queueMaxLeaseMs,
  queueMaxStringLength,
  queueMinLeaseMs,
  queueMaxHandlers,
} from "./task-queue.constants.ts";
import { checkpointValue } from "./workflow/checkpoint-value.ts";

export function queueObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid queue object");
  return Object.fromEntries(Object.entries(value));
}
export function queueString(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.length ||
    value.length > queueMaxStringLength
  )
    throw new Error("Invalid queue identifier");
  return value;
}
export function queueNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    throw new Error("Invalid queue number");
  return value;
}
export function queueLeaseMs(value: unknown): number {
  const ms = queueNumber(value);
  if (ms < queueMinLeaseMs || ms > queueMaxLeaseMs)
    throw new Error("Queue lease must be between 30 and 300000 milliseconds");
  return ms;
}
export function queueJson(value: unknown) {
  const checked = checkpointValue(value);
  if (checked.kind !== "json") throw new Error("Queue values must be JSON");
  if (Buffer.byteLength(JSON.stringify(checked.value)) > queueMaxValueBytes)
    throw new Error("Queue value exceeds size limit");
  return checked.value;
}
export function queueRequest(value: unknown): QueueRequest {
  const data = queueObject(value);
  return {
    id: queueString(data.id),
    handler: queueString(data.handler),
    input: queueJson(data.input),
    ...(data.deadline === undefined
      ? {}
      : { deadline: queueNumber(data.deadline) }),
  };
}
export function queueClaim(value: unknown): QueueClaim {
  const data = queueObject(value);
  if (
    !Array.isArray(data.handlers) ||
    !data.handlers.length ||
    data.handlers.length > queueMaxHandlers
  )
    throw new Error("Invalid queue handlers");
  return {
    worker: queueString(data.worker),
    handlers: data.handlers.map(queueString),
    leaseMs: queueLeaseMs(data.leaseMs),
  };
}
export function queueLease(value: unknown): QueueLease {
  const data = queueObject(value);
  return {
    id: queueString(data.id),
    worker: queueString(data.worker),
    fence: queueNumber(data.fence),
  };
}
export function queueResult(value: unknown): QueueResult {
  const data = queueObject(value);
  const usage = data.usage === undefined ? undefined : queueObject(data.usage);
  return {
    value: queueJson(data.value),
    ...(data.error === undefined ? {} : { error: queueString(data.error) }),
    ...(usage === undefined
      ? {}
      : {
          usage: {
            input: queueNumber(usage.input),
            output: queueNumber(usage.output),
            cached: queueNumber(usage.cached),
            ...(usage.cacheCreated === undefined
              ? {}
              : { cacheCreated: queueNumber(usage.cacheCreated) }),
          },
        }),
  };
}
export function queueJob(value: unknown): QueueJob {
  const data = queueObject(value);
  const status = data.status;
  if (
    status !== "pending" &&
    status !== "active" &&
    status !== "done" &&
    status !== "failed" &&
    status !== "cancelled"
  )
    throw new Error("Invalid queue status");
  return {
    ...queueRequest(data),
    status,
    fence: queueNumber(data.fence),
    ...(data.worker === undefined ? {} : { worker: queueString(data.worker) }),
    ...(data.expires === undefined
      ? {}
      : { expires: queueNumber(data.expires) }),
    ...(data.result === undefined ? {} : { result: queueResult(data.result) }),
  };
}
