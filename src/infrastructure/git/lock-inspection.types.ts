import type { StorageEntry, StorageIssue } from "../storage-inventory.types.ts";

export type LockPidProbe = (pid: number) => void;

export type LockInspectionState =
  | { readonly state: "present" | "absent"; readonly pid: number }
  | {
      readonly state: "unknown";
      readonly reason: string;
      readonly pid?: number;
    }
  | { readonly state: "skipped"; readonly reason: "NOT_FILE" };

export type LockInspectionEntry = Pick<StorageEntry, "name" | "path"> &
  LockInspectionState;

export interface LockInspection {
  readonly complete: boolean;
  readonly scope: "local-pid";
  readonly entries: readonly LockInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
