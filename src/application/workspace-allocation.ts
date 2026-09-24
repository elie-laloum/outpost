import { acquireWorkspace } from "../infrastructure/git/workspace.ts";
import type { WorkspaceLease } from "../infrastructure/git/workspace.types.ts";
import type { WorkspaceOptions } from "./outpost.types.ts";
import { reserveRecoveryStorage } from "./storage-reservation.ts";

export async function allocateWorkspace(
  options: WorkspaceOptions,
): Promise<WorkspaceLease> {
  if (!options.storageQuota) return acquireWorkspace(options);
  const reservation = await reserveRecoveryStorage({
    ...options.storageQuota,
    ...(options.repository ? { repository: options.repository } : {}),
    ...(options.signal ? { signal: options.signal } : {}),
  });
  try {
    options.signal?.throwIfAborted();
    const lease = await acquireWorkspace({
      ...options,
      repository: reservation.repository,
    });
    return {
      ...lease,
      async dispose(preserve) {
        try {
          return await lease.dispose(preserve);
        } finally {
          await reservation.release();
        }
      },
    };
  } catch (error) {
    await reservation.release();
    throw error;
  }
}
