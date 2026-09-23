import type { Task, TaskOptions } from "../workflow.types.ts";
import { positive } from "./validation.ts";

export function task<T>(options: TaskOptions<T>): Task<T> {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(options.key))
    throw new Error(`Invalid task key: ${options.key}`);
  if (options.timeoutMs !== undefined) positive(options.timeoutMs, "timeoutMs");
  if (options.retry) {
    positive(options.retry.attempts, "retry.attempts");
    if (
      !Number.isFinite(options.retry.delayMs ?? 0) ||
      (options.retry.delayMs ?? 0) < 0
    )
      throw new Error("retry.delayMs must be nonnegative");
  }
  return Object.freeze({
    ...options,
    ...(options.retry ? { retry: Object.freeze({ ...options.retry }) } : {}),
    after: Object.freeze([...(options.after ?? [])]),
  });
}
