import { randomUUID } from "node:crypto";
import { lstat, rename, writeFile } from "node:fs/promises";
import { invariant } from "../domain/errors.ts";
import type { FileWorkspaceRecord } from "../domain/file-workspace.types.ts";
import { jsonBytes } from "../infrastructure/transport-json.ts";
import { workspaceFileLimits } from "../infrastructure/workspace-files.constants.ts";
import {
  workspaceManifest,
  workspaceManifestFingerprint,
} from "../infrastructure/workspace-files.ts";
import { snapshotWorkspaceFiles } from "../infrastructure/workspace-snapshot.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import type { FileWorkspace } from "./file-workspace.types.ts";

import { workspaceOwner } from "./file-workspace-owner.ts";
export async function checkpointFileWorkspace(
  workspace: FileWorkspace,
  settled = false,
): Promise<FileWorkspaceRecord> {
  const state = fileWorkspaces.get(workspace);
  invariant(
    state && !state.closed && (!state.active || settled),
    "Workspace checkpoint requires a settled workspace",
  );
  const { id, source, runtime, directory: root } = workspace;
  const { marker, options } = state;
  invariant(
    (await workspaceOwner(marker)).id === id,
    "Workspace ownership changed",
  );
  const rootInfo = await lstat(root);
  invariant(
    rootInfo.isDirectory() &&
      rootInfo.dev === state.record.materialization.device &&
      rootInfo.ino === state.record.materialization.inode,
    "Workspace materialization was replaced",
  );
  const files = await workspaceManifest(root);
  const snapshot =
    options.retention?.policy === "portable"
      ? await snapshotWorkspaceFiles(
          options.retention.transporter,
          root,
          `workspaces/${runtime.namespace}/${id}`,
        )
      : undefined;
  const mountedFingerprint =
    source.kind === "directory" && source.access.mode === "mount"
      ? workspaceManifestFingerprint(await workspaceManifest(source.directory))
      : undefined;
  state.record = {
    ...state.record,
    publicationBaselines: [...state.publications.values()],
    generation: ++state.generation,
    fingerprint: workspaceManifestFingerprint(files),
    ...(mountedFingerprint ? { mountedFingerprint } : {}),
    ...(snapshot ? { snapshot } : {}),
  };
  const temporary = `${marker}.${randomUUID()}`;
  await writeFile(
    temporary,
    JSON.stringify({
      format: 1,
      id,
      namespace: runtime.namespace,
      generation: state.record.generation,
      fingerprint: state.record.fingerprint,
    }),
    { flag: "wx", mode: 0o600 },
  );
  await rename(temporary, marker);
  await recordFileWorkspace(workspace);
  return state.record;
}

export async function recordFileWorkspace(
  workspace: FileWorkspace,
): Promise<void> {
  const state = fileWorkspaces.get(workspace);
  invariant(state && !state.closed, "Workspace record is closed");
  const bytes = jsonBytes(state.record);
  invariant(
    bytes.length <= workspaceFileLimits.manifestBytes,
    "Workspace record exceeds its byte limit",
  );
  const reference = await state.recordTransport.write(
    `workspaces/${workspace.runtime.namespace}/${workspace.id}/record`,
    bytes,
    { ifRevision: state.recordRevision ?? null },
  );
  state.recordRevision = reference.revision;
}
