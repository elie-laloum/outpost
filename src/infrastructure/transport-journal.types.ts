import type {
  TransportReference,
  TransportStoreOptions,
} from "../domain/transport.types.ts";
export interface ReadJournalOptions extends TransportStoreOptions {
  readonly reference: TransportReference;
  readonly maxEntries?: number;
  readonly maxBytes?: number;
}
export interface JournalSnapshot {
  readonly closed: boolean;
  readonly head: TransportReference | null;
}
