import type { TransportStoreOptions } from "../domain/transport.types.ts";

export interface TaskCacheStoreOptions extends TransportStoreOptions {
  readonly maxBytes?: number;
}
