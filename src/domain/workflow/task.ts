import { validateInteraction } from "./input-validation.ts";
import { validateRetry } from "./retry.ts";
import { maxTimerMs } from "./retry.constants.ts";
import type { Task, TaskOptions } from "../workflow.types.ts";
import { positive } from "./validation.ts";
import { validateTaskCache } from "./task-cache.ts";

export function defineTask<T>(options: TaskOptions<T>): Task<T> {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(options.key))
    throw new Error(`Invalid task key: ${options.key}`);
  if (options.timeoutMs !== undefined) positive(options.timeoutMs, "timeoutMs");
  if (options.timeoutMs !== undefined && options.timeoutMs > maxTimerMs)
    throw new Error("timeoutMs exceeds the supported timer range");
  if (options.interaction) {
    validateInteraction(options.interaction);
    if (options.gate)
      throw new Error("A task cannot be both an interaction and a gate");
  }
  if (options.retry) validateRetry(options.retry);
  if (options.cache !== undefined) {
    validateTaskCache(options.cache);
    if (options.interaction || options.gate)
      throw new Error("Interactions and gates cannot use a task cache");
  }
  return Object.freeze({
    ...options,
    ...(options.interaction
      ? {
          interaction: Object.freeze({
            ...options.interaction,
            actors: Object.freeze([...options.interaction.actors]),
          }),
        }
      : {}),
    ...(options.retry ? { retry: Object.freeze({ ...options.retry }) } : {}),
    ...(options.cache ? { cache: Object.freeze({ ...options.cache }) } : {}),
    after: Object.freeze([...(options.after ?? [])]),
  });
}
