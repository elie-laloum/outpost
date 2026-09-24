import { captureRecoveryChecksums } from "./recovery-checksum-capture.ts";
import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { safeDestination } from "../infrastructure/files.ts";
import { git } from "../infrastructure/git/command.ts";
import type {
  HostBackup,
  RemoteChanges,
  RemoteWorkspaceContext,
} from "./remote-workspace.types.ts";
import { extras } from "./workspace-fingerprint.ts";

export async function backupHost(
  context: RemoteWorkspaceContext,
  changes: RemoteChanges,
  synchronized: string,
  transfer: string,
): Promise<HostBackup> {
  const { workspace } = context;
  const { head, incoming } = changes;
  const previousPatch = join(transfer, "previous.patch");
  await git(workspace.directory, [
    "diff",
    "--binary",
    "HEAD",
    `--output=${previousPatch}`,
  ]);
  await git(workspace.directory, [
    "diff",
    "--cached",
    "--binary",
    `--output=${join(transfer, "previous-index.patch")}`,
  ]);
  const previousExtras = await extras(workspace.directory);
  for (const file of previousExtras) {
    const backup = await safeDestination(
      join(transfer, "previous-files"),
      file,
    );
    await mkdir(dirname(backup), { recursive: true });
    await cp(await safeDestination(workspace.directory, file), backup, {
      dereference: false,
    });
  }
  const state = {
    previous: synchronized,
    next: head,
    previousExtras,
    incoming,
  };
  await writeFile(join(transfer, "state.json"), JSON.stringify(state));
  await captureRecoveryChecksums(transfer, state);

  return { previousPatch, previousExtras };
}
