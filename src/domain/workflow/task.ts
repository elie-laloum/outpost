import { validateInteraction } from "./input-validation.ts";
import { validateRetry } from "./retry.ts";
import { maxTimerMs } from "./retry.constants.ts";
import type {
  Task,
  TaskOptions,
  TaskInputsOptions,
  TaskInputValues,
} from "../workflow.types.ts";
import { positive } from "./validation.ts";
import { validateTaskCache } from "./task-cache.ts";

export function defineTask<T, Inputs extends Readonly<Record<string, Task>>>(
  options: TaskInputsOptions<T, Inputs>,
): Task<T>;
export function defineTask<T>(options: TaskOptions<T>): Task<T>;
export function defineTask<T, Inputs extends Readonly<Record<string, Task>>>(
  options: TaskOptions<T> | TaskInputsOptions<T, Inputs>,
): Task<T> {
  if ("inputs" in options) {
    const { inputs, perform, ...definition } = options;
    const dependencies = Object.freeze({ ...inputs });
    return defineTask({
      ...definition,
      after: [
        ...new Set([...(options.after ?? []), ...Object.values(dependencies)]),
      ],
      perform(context) {
        const values = Object.fromEntries(
          Object.entries(dependencies).map(([key, task]) => [
            key,
            context.value(task),
          ]),
        ) as TaskInputValues<Inputs>;
        return perform({ ...context, inputs: Object.freeze(values) });
      },
    });
  }
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
