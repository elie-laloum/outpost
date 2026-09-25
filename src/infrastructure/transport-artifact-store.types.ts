import type { TransportStoreOptions } from "../domain/transport.types.ts";

export interface ArtifactStoreOptions extends TransportStoreOptions {
  readonly maxBytes?: number;
}
