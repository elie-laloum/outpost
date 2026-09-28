import { checkpointValue } from "./checkpoint-value.ts";
import { taskCacheFormat, taskCacheModes } from "./task-cache.constants.ts";
import {
  taskCacheFingerprint,
  validateTaskCacheEntry,
} from "./task-cache-entry.ts";
import type { Task, WorkflowExecutionState } from "../workflow.types.ts";
import type {
  TaskCacheLookup,
  TaskCacheOptions,
  TaskCacheOutcome,
} from "./task-cache.types.ts";

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function notify(
  item: Task,
  runtime: WorkflowExecutionState,
  cache: TaskCacheOutcome,
  error?: unknown,
): void {
  runtime.emit({
    type: "cache",
    key: item.key,
    cache,
    ...(error === undefined ? {} : { error: message(error) }),
  });
}

export function validateTaskCache(options: TaskCacheOptions): void {
  if (
    !options ||
    typeof options !== "object" ||
    typeof options.store?.read !== "function" ||
    typeof options.store.write !== "function" ||
    typeof options.key !== "function"
  )
    throw new Error("Task cache requires a store and a key function");
  if (typeof options.version !== "string" || !options.version.trim())
    throw new Error("Task cache version must not be empty");
  if (
    options.maxAgeMs !== undefined &&
    (!Number.isSafeInteger(options.maxAgeMs) || options.maxAgeMs < 1)
  )
    throw new Error("cache.maxAgeMs must be a positive integer");
  if (options.mode !== undefined && !taskCacheModes.includes(options.mode))
    throw new Error("cache.mode must be reuse or refresh");
}

/** Key errors fail the task; store and entry errors only degrade to a miss. */
export async function lookupTaskCache(
  item: Task,
  cache: TaskCacheOptions,
  runtime: WorkflowExecutionState,
): Promise<TaskCacheLookup> {
  const { signal } = runtime;
  const key = await cache.key(runtime.context(item, 0, signal));
  signal.throwIfAborted();
  const fingerprint = taskCacheFingerprint(
    runtime.workflow,
    item.key,
    cache.version,
    key,
  );
  if (cache.mode === "refresh") {
    notify(item, runtime, "miss");
    return { hit: false, fingerprint };
  }
  try {
    const entry = await cache.store.read(fingerprint, { signal });
    signal.throwIfAborted();
    if (entry === undefined) {
      notify(item, runtime, "miss");
      return { hit: false, fingerprint };
    }
    validateTaskCacheEntry(entry, fingerprint);
    if (
      cache.maxAgeMs !== undefined &&
      Date.now() - Date.parse(entry.createdAt) > cache.maxAgeMs
    ) {
      notify(item, runtime, "miss");
      return { hit: false, fingerprint };
    }
    notify(item, runtime, "hit");
    return {
      hit: true,
      value:
        entry.value.kind === "json"
          ? structuredClone(entry.value.value)
          : undefined,
    };
  } catch (error) {
    signal.throwIfAborted();
    notify(item, runtime, "failed", error);
    return { hit: false, fingerprint };
  }
}

export async function storeTaskCache(
  item: Task,
  cache: TaskCacheOptions,
  runtime: WorkflowExecutionState,
  fingerprint: string,
  value: unknown,
): Promise<void> {
  let output;
  try {
    output = checkpointValue(value);
  } catch (error) {
    throw new Error(
      `Cached task results must be lossless JSON values or undefined: ${message(error)}`,
    );
  }
  try {
    await cache.store.write(
      Object.freeze({
        format: taskCacheFormat,
        fingerprint,
        workflow: runtime.workflow,
        task: item.key,
        version: cache.version,
        createdAt: new Date().toISOString(),
        value: output,
      }),
      { signal: runtime.signal },
    );
    notify(item, runtime, "stored");
  } catch (error) {
    runtime.signal.throwIfAborted();
    notify(item, runtime, "failed", error);
  }
}
