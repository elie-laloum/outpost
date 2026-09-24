export type StorageCategoryName = "recovery" | "logs" | "locks" | "workspaces";
export type StorageEntryKind =
  "file" | "directory" | "symlink" | "other" | "unknown";

export interface StorageIssue {
  readonly path: string;
  readonly code: string;
}
export interface StorageUsage {
  bytes: number;
  files: number;
  directories: number;
  symlinks: number;
  other: number;
}
export interface StorageEntry extends StorageUsage {
  readonly name: string;
  readonly path: string;
  kind: StorageEntryKind;
  modifiedAt?: string;
  complete: boolean;
}
export interface StorageCategory {
  readonly name: StorageCategoryName;
  readonly path: string;
  readonly entries: readonly StorageEntry[];
}
export interface StorageInventory {
  readonly root: string;
  readonly categories: readonly StorageCategory[];
  readonly usage: Readonly<StorageUsage>;
  readonly issues: readonly StorageIssue[];
  readonly complete: boolean;
  readonly scannedEntries: number;
  readonly maxEntries: number;
}
export interface StorageScan {
  remaining: number;
  readonly issues: StorageIssue[];
}
