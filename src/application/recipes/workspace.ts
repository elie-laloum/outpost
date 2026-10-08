import { createLeasedWorkspace } from "../workspace.ts";
import { restoreRecipeWorkspaceLease } from "../../infrastructure/recipes/workspace.ts";
import { observedOperation } from "../../domain/observed-operation.ts";
import { reserveRecoveryStorage } from "../storage-reservation.ts";
import type { Workspace, WorkspaceOptions } from "../outpost.types.ts";
import type { WorkspaceRecord } from "../../domain/workspace.types.ts";

export function recipeWorkspaceRecord(workspace: Workspace): WorkspaceRecord {
  return {
    repository: workspace.repository,
    directory: workspace.directory,
    branch: workspace.branch,
    baseBranch: workspace.baseBranch,
    baseline: workspace.baseline,
    gitDirectories: [...workspace.gitDirectories],
    policy: workspace.policy,
  };
}

export async function restoreRecipeWorkspace(
  record: WorkspaceRecord,
  options: WorkspaceOptions,
): Promise<Workspace> {
  options.signal?.throwIfAborted();
  const reservation = options.storageQuota
    ? await reserveRecoveryStorage({
        ...options.storageQuota,
        repository: record.repository,
        ...(options.signal ? { signal: options.signal } : {}),
      })
    : undefined;
  try {
    const lease = await observedOperation(
      options.observation,
      "git",
      "workspace.restore",
      () => restoreRecipeWorkspaceLease(record, options),
    );
    return createLeasedWorkspace(
      {
        ...lease,
        async dispose(preserve) {
          try {
            return await lease.dispose(preserve);
          } finally {
            await reservation?.release();
          }
        },
      },
      options,
    );
  } catch (error) {
    await reservation?.release();
    throw error;
  }
}
