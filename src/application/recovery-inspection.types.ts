import type { StorageInventory } from "../infrastructure/storage-inventory.types.ts";

export interface RecoveryInspectionOptions {
  readonly repository?: string;
  readonly maxEntries?: number;
}
export interface RecoveryInspection extends StorageInventory {
  readonly repository: string;
  readonly activity: "unverified";
}
