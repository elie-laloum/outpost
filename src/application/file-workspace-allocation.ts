import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { invariant, recordRecovery } from "../domain/errors.ts";
import { fileWorkspaceSourceSchema } from "../domain/file-workspace.constants.ts";
import type {
  FileWorkspaceRecord,
  WorkspaceFileEntry,
} from "../domain/file-workspace.types.ts";
import { validateFilePaths } from "../infrastructure/file-manifest.ts";
import { directory, inside } from "../infrastructure/files.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { executeProcess } from "../infrastructure/process.ts";
import { validateRecipeSchema } from "../infrastructure/recipes/schema.ts";
import type { StorageReservation } from "../infrastructure/storage-reservations.types.ts";
import { jsonBytes } from "../infrastructure/transport-json.ts";
import { reserveTransportStorage } from "../infrastructure/transport-reservations.ts";
import { workspaceFileLimits } from "../infrastructure/workspace-files.constants.ts";
import {
  copyWorkspaceManifest,
  validateWorkspaceSelection,
  workspaceManifest,
  workspaceManifestFingerprint,
} from "../infrastructure/workspace-files.ts";
import {
  canonicalWorkspacePath,
  lockWorkspaceCopySource,
  lockWorkspacePath,
} from "../infrastructure/workspace-lock.ts";
import { restoreWorkspaceFiles } from "../infrastructure/workspace-snapshot.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import type {
  FileWorkspace,
  FileWorkspaceOptions,
  FileWorkspaceRegistration,
} from "./file-workspace.types.ts";
import { createLifecycleHookRunner } from "./lifecycle-hooks.ts";
import type { FileWorkspaceExecution } from "./workspace-execution.types.ts";

import { recordFileWorkspace } from "./file-workspace-checkpoint.ts";
import { managedFileWorkspace } from "./file-workspace-managed.ts";
export async function createFileWorkspace(
  options: FileWorkspaceOptions,
  execution: FileWorkspaceExecution,
  register?: FileWorkspaceRegistration,
): Promise<FileWorkspace> {
  options.signal?.throwIfAborted();
  validateRecipeSchema(
    fileWorkspaceSourceSchema,
    options.source,
    "workspace source",
  );
  if (options.paths) validateWorkspaceSelection(options.paths);
  invariant(
    !["repository", "branch", "guard", "copies"].some((key) => key in options),
    "Git options are not supported by file workspaces",
  );
  invariant(
    options.retention?.policy !== "portable" || !!options.runtime?.namespace,
    "Portable workspaces require an explicit runtime namespace",
  );
  const runtimeDirectory = await canonicalWorkspacePath(
    options.runtime?.directory ?? resolve(".outpost"),
  );
  const namespace =
    options.runtime?.namespace ??
    createHash("sha256").update(runtimeDirectory).digest("hex").slice(0, 24);
  invariant(
    /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(namespace),
    "Invalid runtime namespace",
  );
  const runtime = { directory: runtimeDirectory, namespace };
  const id = randomUUID();
  const owned = join(runtime.directory, "workspaces", id);
  const root = join(owned, "files");
  const marker = join(owned, "owner.json");
  let source = options.source;
  let releaseSource = async () => {};
  let inputs: readonly WorkspaceFileEntry[] = [];
  let releaseOwned = async () => {};
  let sourceLockId: string | undefined;
  let ownedLockId: string | undefined;
  let reservation: StorageReservation | undefined;
  const recordTransport =
    options.retention?.policy === "portable"
      ? options.retention.transporter
      : createLocalTransport({ directory: join(runtime.directory, "storage") });
  let preparation: FileWorkspaceRecord | undefined;
  let recordRevision: string | undefined;
  const savePreparation = async (record: FileWorkspaceRecord) => {
    const bytes = jsonBytes(record);
    invariant(
      bytes.length <= workspaceFileLimits.manifestBytes,
      "Workspace record exceeds its byte limit",
    );
    recordRevision = (
      await recordTransport.write(
        `workspaces/${runtime.namespace}/${id}/record`,
        bytes,
        { ifRevision: recordRevision ?? null },
      )
    ).revision;
    preparation = record;
    await register?.(record);
  };
  if (source.kind === "directory") {
    source = { ...source, directory: await directory(source.directory) };
    invariant(
      !inside(runtime.directory, source.directory),
      "Source cannot be inside runtime control directory",
    );
    if (source.access.mode === "mount") {
      invariant(!options.paths, "Mounted workspaces cannot filter the source");
      invariant(
        !inside(source.directory, runtime.directory) &&
          !inside(runtime.directory, source.directory),
        "Mounted source overlaps runtime control directory",
      );
      validateFilePaths([source.access.target]);
      validateWorkspaceSelection([source.access.target]);
      invariant(
        !/[*?\[\]{}]/.test(source.access.target),
        "Mount target must be a literal relative directory",
      );
    }
    const sourceLock =
      source.access.mode === "copy"
        ? await lockWorkspaceCopySource(source.directory, runtime.directory)
        : await lockWorkspacePath(source.directory, !source.access.readOnly);
    releaseSource = sourceLock;
    sourceLockId = sourceLock.id;
  }
  try {
    if (options.storageQuota)
      reservation = await reserveTransportStorage(
        options.storageQuota.transporter ??
          createLocalTransport({
            directory: join(runtime.directory, "storage"),
          }),
        runtime.namespace,
        options.storageQuota,
      );
    await mkdir(root, { recursive: true, mode: 0o700 });
    const ownedLock = await lockWorkspacePath(root, true);
    releaseOwned = ownedLock;
    ownedLockId = ownedLock.id;
    await writeFile(marker, JSON.stringify({ format: 1, id, namespace }), {
      flag: "wx",
      mode: 0o600,
    });
    const materialization = await lstat(root);
    await savePreparation({
      format: 1,
      id,
      kind: source.kind,
      source,
      ownership: "owned",
      owner: { nonce: randomUUID(), state: "open" },
      locks: {
        materialization: ownedLockId,
        ...(sourceLockId ? { source: sourceLockId } : {}),
      },
      materialization: {
        device: materialization.dev,
        inode: materialization.ino,
      },
      directory: root,
      runtime,
      inputs: [],
      preparation: "preparing",
      inputFingerprint: createHash("sha256")
        .update(JSON.stringify([source, options.paths, options.inputs?.length]))
        .digest("hex"),
      generation: 0,
      fingerprint: workspaceManifestFingerprint([]),
    });
    invariant(preparation, "Workspace preparation record is unavailable");
    if (source.kind === "directory") {
      inputs = await workspaceManifest(
        source.directory,
        options.paths,
        options.signal,
        [runtime.directory],
      );
      await savePreparation({
        ...preparation,
        inputs,
        inputFingerprint: workspaceManifestFingerprint(inputs, options.paths),
        ...(source.access.mode === "mount"
          ? { mountedFingerprint: workspaceManifestFingerprint(inputs) }
          : {}),
      });
      if (source.access.mode === "copy") {
        await copyWorkspaceManifest(
          source.directory,
          root,
          inputs,
          options.signal,
        );
        invariant(
          workspaceManifestFingerprint(
            await workspaceManifest(
              source.directory,
              options.paths,
              options.signal,
              [runtime.directory],
            ),
          ) === workspaceManifestFingerprint(inputs),
          "Workspace source changed during copy",
        );
        await releaseSource();
        sourceLockId = undefined;
      }
    }
    for (const input of options.inputs ?? []) {
      options.signal?.throwIfAborted();
      if ("snapshot" in input) {
        const staging = join(owned, `input-${randomUUID()}`);
        await restoreWorkspaceFiles(input.transporter, input.snapshot, staging);
        await copyWorkspaceManifest(
          staging,
          root,
          await workspaceManifest(staging),
          options.signal,
        );
        await rm(staging, { recursive: true });
        continue;
      }
      const inputDirectory = await directory(input.directory);
      invariant(
        !inside(runtime.directory, inputDirectory),
        "Workspace input overlaps its runtime control directory",
      );
      const release = await lockWorkspaceCopySource(
        inputDirectory,
        runtime.directory,
      );
      try {
        const entries = await workspaceManifest(
          inputDirectory,
          input.paths,
          options.signal,
          [runtime.directory],
        );
        await copyWorkspaceManifest(
          inputDirectory,
          root,
          entries,
          options.signal,
        );
        invariant(
          workspaceManifestFingerprint(
            await workspaceManifest(
              inputDirectory,
              input.paths,
              options.signal,
              [runtime.directory],
            ),
          ) === workspaceManifestFingerprint(entries),
          "Workspace input changed during copy",
        );
      } finally {
        await release();
      }
    }
    await createLifecycleHookRunner(
      options.hooks?.workspaceReady ?? [],
      root,
      executeProcess,
    )(options.signal);
    const initial = await workspaceManifest(root);
    const rootInfo = await lstat(root);
    const record: FileWorkspaceRecord = {
      ...preparation,
      format: 1,
      id,
      kind: source.kind,
      source,
      ownership: "owned",
      owner: preparation.owner,
      preparation: "ready",
      locks: {
        materialization: ownedLockId,
        ...(sourceLockId ? { source: sourceLockId } : {}),
      },
      materialization: { device: rootInfo.dev, inode: rootInfo.ino },
      directory: root,
      runtime,
      inputs,
      inputFingerprint: createHash("sha256")
        .update(
          JSON.stringify([
            workspaceManifestFingerprint(inputs, options.paths),
            workspaceManifestFingerprint(initial),
          ]),
        )
        .digest("hex"),
      ...(source.kind === "directory" && source.access.mode === "mount"
        ? { mountedFingerprint: workspaceManifestFingerprint(inputs) }
        : {}),
      generation: 0,
      fingerprint: workspaceManifestFingerprint(initial),
    };
    await writeFile(
      marker,
      JSON.stringify({
        format: 1,
        id,
        namespace,
        generation: 0,
        fingerprint: record.fingerprint,
      }),
      { mode: 0o600 },
    );
    const mounted = source;
    const suspendSourceForPublication =
      mounted.kind === "directory" &&
      mounted.access.mode === "mount" &&
      mounted.access.readOnly
        ? async () => {
            await releaseSource();
            releaseSource = async () => {};
            return async () => {
              const lock = await lockWorkspacePath(mounted.directory, false);
              releaseSource = lock;
              const state = fileWorkspaces.get(workspace)!;
              state.record = {
                ...state.record,
                locks: { ...state.record.locks, source: lock.id },
              };
              await recordFileWorkspace(workspace);
            };
          }
        : undefined;
    const workspace = managedFileWorkspace(
      record,
      options,
      execution,
      async () => {
        await releaseOwned();
        await releaseSource();
        await reservation?.release();
      },
      suspendSourceForPublication,
      recordRevision,
    );
    await recordFileWorkspace(workspace);
    return workspace;
  } catch (error) {
    recordRecovery(error, {
      workspaceId: id,
      directory: root,
      ownershipFile: marker,
    });
    if (preparation)
      await savePreparation({
        ...preparation,
        preparation: "failed",
        owner: { ...preparation.owner, state: "released" },
      }).catch(() => {});
    await releaseOwned();
    await releaseSource();
    await reservation?.release();
    throw error;
  }
}
