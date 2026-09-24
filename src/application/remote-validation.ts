import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { prepareHistoryValidation } from "./remote-history.ts";
import { verificationGit } from "../infrastructure/git/verification-command.ts";
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
  const validation = join(transfer, "validation");
  if (head === synchronized) await prepareHistoryValidation(context, transfer);
  if (head !== synchronized)
    await verificationGit(validation, [
      "merge-base",
      "--is-ancestor",
      synchronized,
      head,
    ]);
  await verificationGit(validation, ["checkout", "--detach", head]);
  try {
    if ((await readFile(patch)).length)
      await verificationGit(validation, ["apply", "--binary", patch]);
    if (!options.includeUncommitted && (await readFile(initialPatch)).length)
      await verificationGit(validation, ["apply", "--binary", initialPatch]);
    if (!options.includeUncommitted && (await readFile(initialIndex)).length)
      await verificationGit(validation, [
        "apply",
        "--cached",
        "--binary",
        initialIndex,
      ]);
  } finally {
    await rm(validation, { recursive: true, force: true });
  }
}
