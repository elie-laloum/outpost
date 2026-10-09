import { randomUUID } from "node:crypto";
import { chmod, mkdir } from "node:fs/promises";
import type {
  Transport,
  TransportReference,
} from "../domain/transport.types.ts";
import { invariant } from "../domain/errors.ts";
import { archiveFiles, restoreArchiveFiles } from "./transport-archive.ts";
import {
  jsonBytes,
  jsonObject,
  readReference,
  transportReference,
} from "./transport-json.ts";
import { safeDestination } from "./files.ts";
import {
  workspaceManifest,
  workspaceManifestFingerprint,
} from "./workspace-files.ts";
import { workspaceFileLimits } from "./workspace-files.constants.ts";

export async function snapshotWorkspaceFiles(
  transporter: Transport,
  root: string,
  prefix: string,
): Promise<TransportReference> {
  const entries = await workspaceManifest(root);
  const fingerprint = workspaceManifestFingerprint(entries);
  const generation = `${prefix}/${randomUUID()}`;
  const archive = await archiveFiles(
    transporter,
    root,
    entries
      .filter((entry) => entry.kind !== "directory")
      .map((entry) => entry.path),
    generation,
  );
  invariant(
    workspaceManifestFingerprint(await workspaceManifest(root)) === fingerprint,
    "Workspace changed during snapshot",
  );
  const bytes = jsonBytes({
    format: 1,
    archive,
    fingerprint,
    directories: entries
      .filter((entry) => entry.kind === "directory")
      .map(({ path, mode }) => ({ path, mode })),
  });
  invariant(
    bytes.length <= workspaceFileLimits.manifestBytes,
    "Workspace snapshot exceeds manifest limit",
  );
  const reference = await transporter.write(`${generation}/snapshot`, bytes, {
    ifRevision: null,
  });
  return { key: reference.key, revision: reference.revision };
}

export async function restoreWorkspaceFiles(
  transporter: Transport,
  reference: TransportReference,
  destination: string,
): Promise<void> {
  const value = jsonObject(
    await readReference(
      transporter,
      reference,
      workspaceFileLimits.manifestBytes,
    ),
  );
  invariant(
    value &&
      typeof value === "object" &&
      "format" in value &&
      value.format === 1 &&
      "archive" in value &&
      "directories" in value &&
      Array.isArray(value.directories) &&
      value.directories.length <= workspaceFileLimits.entries &&
      "fingerprint" in value &&
      typeof value.fingerprint === "string",
    "Invalid workspace snapshot",
  );
  const directories = value.directories.map((entry: unknown) => {
    invariant(
      entry &&
        typeof entry === "object" &&
        "path" in entry &&
        typeof entry.path === "string" &&
        "mode" in entry &&
        typeof entry.mode === "number" &&
        Number.isInteger(entry.mode) &&
        entry.mode >= 0 &&
        entry.mode <= 0o777,
      "Invalid workspace snapshot directory",
    );
    return { path: entry.path, mode: entry.mode };
  });
  invariant(
    new Set(directories.map((entry) => entry.path)).size === directories.length,
    "Duplicate snapshot directory",
  );
  for (const entry of directories)
    await safeDestination(destination, entry.path);
  await restoreArchiveFiles(
    transporter,
    transportReference(value.archive),
    destination,
  );
  for (const entry of directories)
    await mkdir(await safeDestination(destination, entry.path), {
      recursive: true,
      mode: 0o700,
    });
  for (const entry of directories.reverse())
    await chmod(await safeDestination(destination, entry.path), entry.mode);
  invariant(
    workspaceManifestFingerprint(await workspaceManifest(destination)) ===
      value.fingerprint,
    "Workspace snapshot integrity mismatch",
  );
}
