import type {
  TransportReference,
  TransportStoreOptions,
} from "../domain/transport.types.ts";
export interface RecoveryArchiveOptions extends TransportStoreOptions {
  readonly directory: string;
  readonly maxBytes?: number;
}
export interface RecoveryArchiveRestoreOptions extends TransportStoreOptions {
  readonly reference: TransportReference;
  readonly destination: string;
  readonly maxBytes?: number;
}
