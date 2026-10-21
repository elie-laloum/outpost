import { link, lstat, readlink, symlink } from "node:fs/promises";
import { invariant } from "../../../domain/errors.ts";
import type { WorkspaceFileEntry } from "../../../domain/file-workspace.types.ts";
import { fileManifest } from "../../../infrastructure/file-manifest.ts";
import { safeDestination } from "../../../infrastructure/files.ts";

export function sameEntry(
  left: WorkspaceFileEntry | undefined,
  right: WorkspaceFileEntry | undefined,
): boolean {
  if (!left || !right) return left === right;
  return (
    left.kind === right.kind &&
    left.mode === right.mode &&
    left.size === right.size &&
    left.sha256 === right.sha256
  );
}

export async function currentEntry(
  root: string,
  path: string,
): Promise<WorkspaceFileEntry | undefined> {
  const target = await safeDestination(root, path);
  const info = await lstat(target).catch((error) => {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      return undefined;
    throw error;
  });
  if (!info) return undefined;
  invariant(
    !info.isDirectory(),
    `Publication file conflicts with directory: ${path}`,
  );
  return fileManifest(root, path);
}

export async function installExclusive(
  source: string,
  destination: string,
): Promise<void> {
  if ((await lstat(source)).isSymbolicLink()) {
    await symlink(await readlink(source), destination);
    return;
  }
  await link(source, destination);
}
