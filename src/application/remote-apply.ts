import { cp, lstat, mkdir, readFile, rm, rmdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import { safeDestination } from "../infrastructure/files.ts";
import { git } from "../infrastructure/git/command.ts";
import type {
  HostBackup,
  RemoteChanges,
  RemoteWorkspaceContext,
} from "./remote-workspace.types.ts";
import { digest } from "./workspace-fingerprint.ts";

export async function applyChanges(
  context: RemoteWorkspaceContext,
  changes: RemoteChanges,
  backup: HostBackup,
  synchronized: string,
  expected: string,
  transfer: string,
): Promise<void> {
  const {
    workspace,
    options,
    recovery,
    protectedFiles,
    initialPatch,
    initialIndex,
  } = context;
  const { head, patch, incoming } = changes;
  const { previousPatch, previousExtras } = backup;
  if ((await digest(workspace.directory, recovery)) !== expected)
    throw new OutpostError(
      "conflict",
      "Host workspace changed during synchronization",
      { recovery },
    );
  if (head !== synchronized)
    await git(workspace.directory, [
      "fetch",
      join(transfer, "commits.bundle"),
      "HEAD",
    ]);
  if ((await readFile(previousPatch)).length)
    await git(workspace.directory, [
      "apply",
      "--reverse",
      "--binary",
      previousPatch,
    ]);
  await git(workspace.directory, ["reset", "--mixed", "HEAD"]);
  for (const file of previousExtras.filter(
    (file) => !protectedFiles.includes(file),
  )) {
    const target = await safeDestination(workspace.directory, file);
    await rm(target, { force: true });
    let parent = dirname(target);
    while (parent !== resolve(workspace.directory)) {
      const removed = await rmdir(parent).then(
        () => true,
        (error: NodeJS.ErrnoException) => {
          if (
            error.code === "ENOTEMPTY" ||
            error.code === "ENOENT" ||
            error.code === "EEXIST"
          )
            return false;
          throw error;
        },
      );
      if (!removed) break;
      parent = dirname(parent);
    }
  }
  if (head !== synchronized)
    await git(workspace.directory, ["merge", "--ff-only", "FETCH_HEAD"]);
  if ((await readFile(patch)).length)
    await git(workspace.directory, ["apply", "--binary", patch]);
  if (!options.includeUncommitted && (await readFile(initialPatch)).length)
    await git(workspace.directory, ["apply", "--binary", initialPatch]);
  if (!options.includeUncommitted && (await readFile(initialIndex)).length)
    await git(workspace.directory, [
      "apply",
      "--cached",
      "--binary",
      initialIndex,
    ]);
  for (const file of incoming) {
    const target = await safeDestination(workspace.directory, file);
    if ((await lstat(target).catch(() => undefined))?.isDirectory())
      await rmdir(target);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(transfer, "incoming", file), target, {
      dereference: false,
      verbatimSymlinks: true,
      force: false,
      errorOnExist: true,
    });
  }
}
