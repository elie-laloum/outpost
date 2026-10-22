import type { ObservationSink } from "../domain/observation.types.ts";

/** Observation sink appending one JSON object per line to a file it owns. */
export interface ObservationFile extends ObservationSink, AsyncDisposable {
  close(): Promise<void>;
}
