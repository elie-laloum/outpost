import { invariant, OutpostError } from "../domain/errors.ts";
import {
  workspaceManifest,
  workspaceManifestFingerprint,
} from "../infrastructure/workspace-files.ts";
import type {
  FileSettlement,
  ProvisionedFileSandbox,
} from "./file-sandbox-context.types.ts";
import { synchronizeFileWorkspace } from "./file-sandbox-synchronization.ts";
import { checkpointFileWorkspace } from "./file-workspace-lifecycle.ts";
import type { FileWorkspaceRegistration } from "./file-workspace.types.ts";

/** Brackets sandbox operations with readiness hooks, then synchronizes and checkpoints files. */
export function createFileSettlement(
  sandbox: ProvisionedFileSandbox,
  onSettled?: FileWorkspaceRegistration,
): FileSettlement {
  const { options, workspace, state, signal, hostHooks, sandboxHooks } =
    sandbox;
  let failed = false;
  const settlement: FileSettlement = {
    failed: () => failed,
    synchronize: () => synchronizeFileWorkspace(sandbox),
    async checkpoint() {
      const record = await checkpointFileWorkspace(workspace, true);
      await onSettled?.(record);
      return record;
    },
    async settled(action, operationSignal) {
      let failure: unknown;
      try {
        const preparationSignal = operationSignal
          ? AbortSignal.any([signal, operationSignal])
          : signal;
        await hostHooks(preparationSignal, true, options.observation);
        if (options.sandboxProvider.placement === "remote")
          invariant(
            workspaceManifestFingerprint(
              await workspaceManifest(workspace.directory),
            ) === state.record.fingerprint,
            "Host files changed before remote execution; prepare file changes through sandboxReady",
          );
        await sandboxHooks(preparationSignal, true, options.observation);
        return await action();
      } catch (error) {
        failed = true;
        failure = error;
        throw error;
      } finally {
        try {
          await settlement.synchronize();
          await settlement.checkpoint();
        } catch (error) {
          failed = true;
          throw new OutpostError(
            "workspace",
            "File workspace could not settle; preserve it for explicit recovery",
            { workspaceId: workspace.id, directory: workspace.directory },
            failure === undefined
              ? error
              : new AggregateError(
                  [failure, error],
                  "Execution and settlement failed",
                ),
          );
        }
      }
    },
  };
  return settlement;
}
