import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import { git } from "../infrastructure/git/command.ts";
import type {
  RemoteChanges,
  RemoteWorkspaceContext,
} from "./remote-workspace.types.ts";
import { remoteSyncLimits } from "./remote-workspace.constants.ts";
import { digest } from "./workspace-fingerprint.ts";

export async function validateChanges(
  context: RemoteWorkspaceContext,
  changes: RemoteChanges,
  synchronized: string,
  expected: string,
  transfer: string,
): Promise<void> {
  const {
    workspace,
    options,
    recovery,
    run,
    protectedFiles,
    originalHead,
    initialPatch,
    initialIndex,
  } = context;
  const { head, patch, incoming } = changes;
  const ignoredOverlaps: string[] = [];
  for (
    let offset = 0;
    offset < incoming.length;
    offset += remoteSyncLimits.pathspecs
  ) {
    ignoredOverlaps.push(
      ...(
        await git(workspace.directory, [
          "ls-files",
          "--others",
          "--ignored",
          "--exclude-standard",
          "-z",
          "--",
          ...incoming
            .slice(offset, offset + remoteSyncLimits.pathspecs)
            .map((path) => `:(literal)${path}`),
        ])
      )
        .split("\0")
        .filter(Boolean),
    );
  }
  if (ignoredOverlaps.length)
    throw new OutpostError(
      "conflict",
      "Remote changes overlap ignored host files",
      { files: ignoredOverlaps, recovery: transfer },
    );
  if (protectedFiles.length) {
    const changed = new Set([
      ...(await run(["diff", "--name-only", "-z", originalHead]))
        .split("\0")
        .filter(Boolean),
      ...incoming,
    ]);
    const overlaps = protectedFiles.filter((file) =>
      [...changed].some(
        (path) =>
          path === file ||
          path.startsWith(`${file}/`) ||
          file.startsWith(`${path}/`),
      ),
    );
    if (overlaps.length)
      throw new OutpostError(
        "conflict",
        "Remote changes overlap uncommitted host files",
        { files: overlaps, recovery: transfer },
      );
  }
  if ((await digest(workspace.directory, recovery)) !== expected)
    throw new OutpostError(
      "conflict",
      "Host workspace changed while the remote sandbox was active",
      { recovery },
    );
  if (head !== synchronized) {
    await git(workspace.directory, [
      "fetch",
      join(transfer, "commits.bundle"),
      "HEAD",
    ]);
    await git(workspace.directory, [
      "merge-base",
      "--is-ancestor",
      "HEAD",
      "FETCH_HEAD",
    ]);
  }
  const validation = join(transfer, "validation");
  await git(workspace.directory, [
    "worktree",
    "add",
    "--detach",
    validation,
    head,
  ]);
  try {
    if ((await readFile(patch)).length)
      await git(validation, ["apply", "--binary", patch]);
    if (!options.includeUncommitted && (await readFile(initialPatch)).length)
      await git(validation, ["apply", "--binary", initialPatch]);
    if (!options.includeUncommitted && (await readFile(initialIndex)).length)
      await git(validation, ["apply", "--cached", "--binary", initialIndex]);
  } finally {
    await git(workspace.directory, [
      "worktree",
      "remove",
      "--force",
      validation,
    ]);
  }
}
