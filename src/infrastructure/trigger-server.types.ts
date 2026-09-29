import type { TaskQueue } from "../domain/task-queue.types.ts";
import type { TriggerJob } from "../domain/trigger-job.types.ts";
import type { TriggerEvent, TriggerSource } from "../domain/trigger.types.ts";

export interface TriggerRoute {
  /** Exact request path, such as `/github`; part of each job identifier. */
  readonly path: string;
  readonly source: TriggerSource;
  /** Maps a verified event to a job, or `undefined` to ignore it; must return promptly. */
  on(
    event: TriggerEvent,
  ): TriggerJob | undefined | Promise<TriggerJob | undefined>;
}

export interface TriggerFailure {
  readonly path: string;
  readonly stage: "verify" | "route" | "enqueue";
  readonly delivery?: string;
}

export interface TriggerServerOptions {
  readonly queue: TaskQueue;
  readonly routes: readonly TriggerRoute[];
  /** Defaults to 127.0.0.1; expose through a TLS-terminating proxy. */
  readonly host?: string;
  readonly port?: number;
  /** Request body limit; defaults to 1 MiB, at most 25 MiB. */
  readonly maxBytes?: number;
  /** Observes rejected or failed requests; never receives secrets. */
  readonly onError?: (error: unknown, failure: TriggerFailure) => void;
}

export interface TriggerServer {
  readonly url: string;
  close(): Promise<void>;
}
