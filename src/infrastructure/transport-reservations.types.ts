import type { LocalProcessIdentity } from "./git/process-identity.types.ts";

export interface StorageReservationRecord {
  readonly bytes: number;
  readonly owner?: {
    readonly id: string;
    readonly host: string;
    readonly pid: number;
    readonly createdAt: string;
    readonly repository: string;
    readonly identity?: LocalProcessIdentity;
  };
}

export interface ReservationLedger {
  readonly format: 2;
  readonly reservations: Readonly<Record<string, StorageReservationRecord>>;
}

export interface StorageReservationInspection {
  readonly revision?: string;
  readonly reservations: Readonly<Record<string, StorageReservationRecord>>;
}

export interface StorageReservationRecoveryOptions {
  readonly id: string;
  readonly revision: string;
  readonly processesStopped: true;
}
