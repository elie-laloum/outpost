import type { StorageReservationOptions } from "../infrastructure/storage-reservations.types.ts";

export interface RecoveryStorageReservationOptions extends StorageReservationOptions {
  readonly repository?: string;
}
