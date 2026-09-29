import { createHash } from "node:crypto";
import { canonicalJson } from "./canonical-json.ts";
import { checkpointValue } from "./checkpoint-value.ts";
import { taskCacheFormat } from "./task-cache.constants.ts";
import type { TaskCacheEntry } from "./task-cache.types.ts";

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function taskCacheFingerprint(
  workflow: string,
  task: string,
  version: string,
  key: unknown,
): string {
  let parts;
  try {
    parts = checkpointValue(key);
  } catch {
    throw new Error("Task cache key must be a lossless JSON value");
  }
  if (parts.kind !== "json")
    throw new Error("Task cache key must be a lossless JSON value");
  return createHash("sha256")
    .update(
      canonicalJson({
        format: taskCacheFormat,
        workflow,
        task,
        version,
        key: parts.value,
      }),
    )
    .digest("hex");
}

export function validateTaskCacheEntry(
  value: unknown,
  fingerprint: string,
): asserts value is TaskCacheEntry {
  const invalid = () => new Error("Invalid task cache entry");
  if (
    !object(value) ||
    value.format !== taskCacheFormat ||
    value.fingerprint !== fingerprint ||
    typeof value.workflow !== "string" ||
    typeof value.task !== "string" ||
    typeof value.version !== "string" ||
    typeof value.createdAt !== "string" ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    !object(value.value)
  )
    throw invalid();
  const output = value.value;
  if (output.kind === "undefined" && !Object.hasOwn(output, "value")) return;
  if (output.kind !== "json" || output.value === undefined) throw invalid();
  checkpointValue(output.value);
}
