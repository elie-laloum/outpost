import type { TaskContext } from "../workflow.types.ts";
import type {
  WorkflowCheckpointValue,
  WorkflowJson,
} from "./checkpoint.types.ts";

export type TaskCacheMode = "reuse" | "refresh";

export type TaskCacheOutcome = "hit" | "miss" | "stored" | "failed";

export interface TaskCacheEntry {
  readonly format: 1;
  readonly fingerprint: string;
  readonly workflow: string;
  readonly task: string;
  readonly version: string;
  readonly createdAt: string;
  readonly value: WorkflowCheckpointValue;
}

export interface TaskCacheAccessOptions {
  readonly signal?: AbortSignal;
}

export interface TaskCacheStore {
  read(
    fingerprint: string,
    options?: TaskCacheAccessOptions,
  ): Promise<TaskCacheEntry | undefined>;
  write(entry: TaskCacheEntry, options?: TaskCacheAccessOptions): Promise<void>;
}

export interface TaskCacheOptions {
  readonly store: TaskCacheStore;
  /** Change when the task implementation, agent or output contract changes. */
  readonly version: string;
  readonly key: (context: TaskContext) => WorkflowJson | Promise<WorkflowJson>;
  readonly maxAgeMs?: number;
  readonly mode?: TaskCacheMode;
}

export type TaskCacheLookup =
  | { readonly hit: true; readonly value: unknown }
  | { readonly hit: false; readonly fingerprint: string };
