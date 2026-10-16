import type { LockOwnership } from "./process-identity.types.ts";

export interface LocalLockSnapshot {
  readonly path: string;
  readonly revision: string;
  readonly pid?: number;
  readonly ownership?: LockOwnership;
}

export interface LocalLockRecoveryOptions {
  readonly revision: string;
  readonly processesStopped: true;
}
