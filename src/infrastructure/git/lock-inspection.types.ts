import type { LockOwnership } from "./process-identity.types.ts";
import type { StorageEntry, StorageIssue } from "../storage-inventory.types.ts";

export type LockPidProbe = (pid: number) => void;

export interface LockIdentityRecord {
  readonly pid: number;
  readonly identity?: unknown;
}

export type LockInspectionState = { readonly ownership?: LockOwnership } & (
  | { readonly state: "present" | "absent"; readonly pid: number }
  | {
      readonly state: "unknown";
      readonly reason: string;
      readonly pid?: number;
    }
  | { readonly state: "skipped"; readonly reason: "NOT_FILE" }
);

export type LockInspectionEntry = Pick<StorageEntry, "name" | "path"> &
  LockInspectionState;

export interface LockInspection {
  readonly complete: boolean;
  readonly scope: "local-pid";
  readonly entries: readonly LockInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
