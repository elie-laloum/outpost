import type { Transport } from "../domain/transport.types.ts";
import type { ResourceInspection } from "../infrastructure/resource-activity.types.ts";
import type { LockInspection } from "../infrastructure/git/lock-inspection.types.ts";
import type { WorkspaceGitInspection } from "../infrastructure/git/worktree-inspection.types.ts";
import type { StorageInventory } from "../infrastructure/storage-inventory.types.ts";

export interface RecoveryInspectionOptions {
  readonly transporter?: Transport;
  readonly repository?: string;
  readonly maxEntries?: number;
  readonly git?: boolean;
  readonly locks?: boolean;
  readonly resources?: boolean;
}
export interface RecoveryInspection extends StorageInventory {
  readonly repository: string;
  readonly activity: "unverified";
  readonly git?: WorkspaceGitInspection;
  readonly locks?: LockInspection;
  readonly resources?: ResourceInspection;
}
