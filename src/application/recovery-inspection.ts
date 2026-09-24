import { inspectResourceActivity } from "../infrastructure/resource-activity-inspection.ts";
import { inspectLocks } from "../infrastructure/git/lock-inspection.ts";
import { join } from "node:path";
import { directory } from "../infrastructure/files.ts";
import { git } from "../infrastructure/git/command.ts";
import { inspectWorktreeGit } from "../infrastructure/git/worktree-inspection.ts";
import { storageInventory } from "../infrastructure/storage-inventory.ts";
import type {
  RecoveryInspection,
  RecoveryInspectionOptions,
} from "./recovery-inspection.types.ts";

export async function inspectRecovery(
  options: RecoveryInspectionOptions = {},
): Promise<RecoveryInspection> {
  const requested = await directory(options.repository);
  const repository = await directory(
    (await git(requested, ["rev-parse", "--show-toplevel"])).trim(),
  );
  const inventory = await storageInventory(
    join(repository, ".outpost"),
    options.maxEntries,
  );
  const gitReport = options.git
    ? await inspectWorktreeGit(
        repository,
        inventory.categories.find((category) => category.name === "workspaces")
          ?.entries ?? [],
      )
    : undefined;
  const lockReport = options.locks
    ? await inspectLocks(
        inventory.categories.find((category) => category.name === "locks")
          ?.entries ?? [],
      )
    : undefined;
  const resources = options.resources
    ? await inspectResourceActivity(repository, options.maxEntries)
    : undefined;
  return {
    repository,
    activity: "unverified",
    ...inventory,
    ...(resources ? { resources } : {}),
    ...(gitReport ? { git: gitReport } : {}),
    ...(lockReport ? { locks: lockReport } : {}),
  };
}
