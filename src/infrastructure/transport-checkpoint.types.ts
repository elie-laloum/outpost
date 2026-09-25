import type { TransportStoreOptions } from "../domain/transport.types.ts";

export interface CheckpointRecoveryOptions extends TransportStoreOptions {
  readonly runId: string;
  readonly revision: string;
}

export interface CheckpointEnvelope {
  readonly owner: string | null;
  readonly checkpoint?: unknown;
}
