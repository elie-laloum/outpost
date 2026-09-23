import { recordRecovery } from "../domain/errors.ts";
import type { WorkspaceRecord } from "../domain/workspace.types.ts";
import { journal } from "../infrastructure/journal.ts";
import type { StartupRecoveryOptions } from "./startup-recovery.types.ts";

export async function startupFailure(
  workspace: WorkspaceRecord,
  cause: unknown,
  options: StartupRecoveryOptions,
): Promise<void> {
  try {
    const log = await journal(
      workspace.repository,
      options.logging,
      options.label,
    );
    log.record({
      kind: "phase",
      name: "preparation failed",
      branch: workspace.branch,
      directory: workspace.directory,
    });
    log.record({
      kind: "failure",
      message: cause instanceof Error ? cause.message : String(cause),
    });
    await log.close();
    recordRecovery(cause, {
      branch: workspace.branch,
      directory: workspace.directory,
      log: log.file,
    });
  } catch {}
}
