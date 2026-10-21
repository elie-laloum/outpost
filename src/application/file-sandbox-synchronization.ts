import { randomUUID } from "node:crypto";
import { lstat, mkdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { invariant, recordRecovery } from "../domain/errors.ts";
import {
  copyWorkspaceManifest,
  workspaceManifest,
  workspaceManifestFingerprint,
} from "../infrastructure/workspace-files.ts";
export { validateFileAgent } from "./file-agent-validation.ts";

import type { FileSandboxSynchronizationContext } from "./file-sandbox-context.types.ts";
export async function synchronizeFileWorkspace({
  options,
  workspace,
  state,
  lease,
  staging,
}: FileSandboxSynchronizationContext) {
  if (options.sandboxProvider.placement !== "remote") return;
  const incoming = join(staging, randomUUID());
  await lease.download(`${lease.root}/.`, incoming, {
    ...(options.limits?.collectMs
      ? { deadlineMs: options.limits.collectMs }
      : {}),
  });
  const collected = await workspaceManifest(incoming);
  invariant(
    workspaceManifestFingerprint(
      await workspaceManifest(workspace.directory),
    ) === state.record.fingerprint,
    "Host workspace changed during remote execution",
  );
  const old = `${workspace.directory}.previous-${randomUUID()}`;
  await rename(workspace.directory, old);
  try {
    invariant(
      workspaceManifestFingerprint(await workspaceManifest(old)) ===
        state.record.fingerprint,
      "Host workspace changed before remote synchronization",
    );
    await mkdir(workspace.directory, { mode: 0o700 });
    await copyWorkspaceManifest(incoming, workspace.directory, collected);
    invariant(
      workspaceManifestFingerprint(
        await workspaceManifest(workspace.directory),
      ) === workspaceManifestFingerprint(collected),
      "Host workspace changed during remote synchronization",
    );
  } catch (error) {
    recordRecovery(error, {
      previousDirectory: old,
      incomingDirectory: incoming,
      directory: workspace.directory,
    });
    throw error;
  }
  await rm(old, { recursive: true });
  await rm(incoming, { recursive: true });
  const info = await lstat(workspace.directory);
  state.record = {
    ...state.record,
    fingerprint: workspaceManifestFingerprint(collected),
    materialization: { device: info.dev, inode: info.ino },
  };
}
