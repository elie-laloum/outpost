import type { WorkspaceGitInspection } from "../infrastructure/git/worktree-inspection.types.ts";
import type { StorageInventory } from "../infrastructure/storage-inventory.types.ts";

export interface RecoveryInspectionOptions {
  readonly repository?: string;
  readonly maxEntries?: number;
  readonly git?: boolean;
}
export interface RecoveryInspection extends StorageInventory {
  readonly repository: string;
  readonly activity: "unverified";
  readonly git?: WorkspaceGitInspection;
}
