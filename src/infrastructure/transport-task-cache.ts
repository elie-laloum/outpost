import { TransportConflict } from "../domain/transport.ts";
import { validateTaskCacheEntry } from "../domain/workflow/task-cache-entry.ts";
import type { TaskCacheStore } from "../domain/workflow/task-cache.types.ts";
import { jsonBytes, jsonObject } from "./transport-json.ts";
import {
  taskCacheMaxBytes,
  taskCachePrefix,
} from "./transport-task-cache.constants.ts";
import type { TaskCacheStoreOptions } from "./transport-task-cache.types.ts";

function key(fingerprint: string): string {
  if (!/^[0-9a-f]{64}$/.test(fingerprint))
    throw new Error("Task cache fingerprint must be a SHA-256 hex digest");
  return `${taskCachePrefix}/${fingerprint}.json`;
}

export function createTaskCacheStore(
  options: TaskCacheStoreOptions,
): TaskCacheStore {
  const { transporter } = options;
  const maxBytes = options.maxBytes ?? taskCacheMaxBytes;
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1)
    throw new Error("Task cache maxBytes must be a positive integer");
  return {
    async read(fingerprint, access = {}) {
      const object = await transporter.read(key(fingerprint), {
        maxBytes,
        ...(access.signal ? { signal: access.signal } : {}),
      });
      if (!object) return undefined;
      let entry: unknown;
      try {
        entry = jsonObject(object);
      } catch {
        throw new Error("Invalid task cache entry");
      }
      validateTaskCacheEntry(entry, fingerprint);
      return entry;
    },
    async write(entry, access = {}) {
      validateTaskCacheEntry(entry, entry.fingerprint);
      const target = key(entry.fingerprint);
      const bytes = jsonBytes(entry);
      if (bytes.byteLength > maxBytes)
        throw new Error(`Task cache entry exceeds ${maxBytes} bytes`);
      const signal = access.signal ? { signal: access.signal } : {};
      // Reading without the entry limit lets expired or corrupt oversized entries be replaced.
      const current = await transporter.read(target, signal);
      try {
        await transporter.write(target, bytes, {
          ifRevision: current?.revision ?? null,
          ...signal,
        });
      } catch (error) {
        // A concurrent writer stored a result for the same fingerprint first.
        if (!(error instanceof TransportConflict)) throw error;
      }
    },
  };
}
