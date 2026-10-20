import type {
  ObservationHub,
  ObservationHubOptions,
} from "../domain/observation.types.ts";
import type {
  ReadRunOptions,
  RunEvent,
  RunSnapshot,
  WatchRunOptions,
} from "../domain/run.types.ts";
import type { Transport } from "../domain/transport.types.ts";

export interface ObservationOptions extends ObservationHubOptions {
  readonly transporter?: Transport;
  readonly heartbeatMs?: number;
  readonly abandonAfterMs?: number;
}

export interface ObservationReadOptions extends Omit<
  ReadRunOptions,
  "transporter" | "id"
> {}

export interface ObservationWatchOptions extends Omit<
  WatchRunOptions,
  "transporter" | "id"
> {}

export interface ObservationClient extends ObservationHub {
  flush(): Promise<void>;
  close(): Promise<void>;
  readRun(
    id: string,
    options?: ObservationReadOptions,
  ): Promise<RunSnapshot | undefined>;
  watchRun(
    id: string,
    options?: ObservationWatchOptions,
  ): AsyncIterable<RunEvent>;
  [Symbol.asyncDispose](): Promise<void>;
}

export interface ObservationClientState {
  readonly pending: Set<Promise<void>>;
  readonly errors: unknown[];
  readonly hubs: Set<ObservationHub>;
  dropped: number;
  closed: boolean;
}

export interface ObservationClientAncestor {
  active(): boolean;
  readonly pending: Set<Promise<void>>;
}
