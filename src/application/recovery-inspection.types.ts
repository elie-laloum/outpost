import type { LockInspection } from "../infrastructure/git/lock-inspection.types.ts";
import type { WorkspaceGitInspection } from "../infrastructure/git/worktree-inspection.types.ts";
import type { StorageInventory } from "../infrastructure/storage-inventory.types.ts";

export interface RecoveryInspectionOptions {
  readonly repository?: string;
  readonly maxEntries?: number;
  readonly git?: boolean;
  readonly locks?: boolean;
}
export interface RecoveryInspection extends StorageInventory {
  readonly repository: string;
  readonly activity: "unverified";
  readonly git?: WorkspaceGitInspection;
  readonly locks?: LockInspection;
}
