import { randomUUID } from "node:crypto";
import { lstat, mkdir, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { invariant } from "../domain/errors.ts";
import { fileWorkspaceRecordSchema } from "../domain/file-workspace.constants.ts";
import type { FileWorkspaceRecord } from "../domain/file-workspace.types.ts";
import { validateFilePaths } from "../infrastructure/file-manifest.ts";
import { directory, inside, safeDestination } from "../infrastructure/files.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { validateRecipeSchema } from "../infrastructure/recipes/schema.ts";
import { restoreArchiveFiles } from "../infrastructure/transport-archive.ts";
import { jsonObject } from "../infrastructure/transport-json.ts";
import { workspaceFileLimits } from "../infrastructure/workspace-files.constants.ts";
import {
  copyWorkspaceManifest,
  validateWorkspaceSelection,
  workspaceManifest,
  workspaceManifestFingerprint,
} from "../infrastructure/workspace-files.ts";
import {
  canonicalWorkspacePath,
  lockWorkspacePath,
} from "../infrastructure/workspace-lock.ts";
import { restoreWorkspaceFiles } from "../infrastructure/workspace-snapshot.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import type {
  FileWorkspace,
  RestoreFileWorkspaceOptions,
} from "./file-workspace.types.ts";
import type { FileWorkspaceExecution } from "./workspace-execution.types.ts";

import { recordFileWorkspace } from "./file-workspace-checkpoint.ts";
import { workspaceFingerprint } from "./file-workspace-fingerprint.ts";
import { managedFileWorkspace } from "./file-workspace-managed.ts";
import { workspaceOwner } from "./file-workspace-owner.ts";
export async function restoreFileWorkspace(
  record: FileWorkspaceRecord,
  execution: FileWorkspaceExecution,
  options: RestoreFileWorkspaceOptions = {},
): Promise<FileWorkspace> {
  validateRecipeSchema(fileWorkspaceRecordSchema, record, "workspace record");
  invariant(
    record.format === 1 &&
      record.ownership === "owned" &&
      record.kind === record.source.kind,
    "Invalid file workspace record",
  );
  invariant(
    !options.portable ||
      (options.retention?.policy === "portable" &&
        !!options.runtime?.namespace &&
        !!record.snapshot),
    "Portable restoration requires a snapshot, explicit Transport and namespace",
  );
  const runtime = {
    directory: await canonicalWorkspacePath(
      options.runtime?.directory ?? record.runtime.directory,
    ),
    namespace: options.runtime?.namespace ?? record.runtime.namespace,
  };
  invariant(
    runtime.namespace === record.runtime.namespace,
    "Workspace namespace changed during restoration",
  );
  const recordTransport =
    options.retention?.policy === "portable"
      ? options.retention.transporter
      : createLocalTransport({ directory: join(runtime.directory, "storage") });
  const saved = await recordTransport.read(
    `workspaces/${runtime.namespace}/${record.id}/record`,
    { maxBytes: workspaceFileLimits.manifestBytes },
  );
  invariant(
    saved,
    "Workspace record is missing; it will not be recreated silently",
  );
  const current = validateRecipeSchema<FileWorkspaceRecord>(
    fileWorkspaceRecordSchema,
    jsonObject(saved),
    "workspace record",
  );
  const recoverCurrent = options.recover?.expectedRevision === saved.revision;
  invariant(
    current.id === record.id &&
      (current.owner.nonce === record.owner.nonce || recoverCurrent) &&
      ((current.generation === record.generation &&
        current.fingerprint === record.fingerprint) ||
        (recoverCurrent && options.recover?.adoptInterruptedFiles)),
    "Workspace ownership or settled generation changed; inspect the current record before explicit recovery",
  );
  invariant(
    current.owner.state === "released" || options.recover?.processesStopped,
    "Workspace ownership requires explicit recovery after stopping its processes",
  );
  invariant(
    !current.allocation ||
      current.allocation.state === "released" ||
      options.recover?.allocationReleased,
    "Workspace sandbox allocation is unsettled; explicitly release or recover it before restoring files",
  );
  invariant(
    !current.preparation ||
      current.preparation === "ready" ||
      options.recover?.adoptInterruptedFiles,
    "Workspace preparation is incomplete; explicit recovery must adopt its retained files",
  );
  record = current;
  invariant(
    inside(join(record.runtime.directory, "workspaces"), record.directory) &&
      record.directory === resolve(record.directory) &&
      basename(record.directory) === "files" &&
      (basename(dirname(record.directory)) === record.id ||
        basename(dirname(record.directory)).startsWith(`${record.id}-`)),
    "Workspace materialization is outside its owned runtime root",
  );
  if (
    record.source.kind === "directory" &&
    record.source.access.mode === "mount"
  ) {
    validateFilePaths([record.source.access.target]);
    validateWorkspaceSelection([record.source.access.target]);
    invariant(
      !/[*?\[\]{}]/.test(record.source.access.target),
      "Mount target must be a literal relative directory",
    );
  }
  let releaseSource = async () => {};
  let releaseOwned = async () => {};
  let sourceLockId: string | undefined;
  if (
    record.source.kind === "directory" &&
    record.source.access.mode === "mount"
  ) {
    invariant(
      (await directory(record.source.directory)) === record.source.directory,
      "Mounted source canonical identity changed",
    );
    invariant(
      !inside(record.source.directory, runtime.directory) &&
        !inside(runtime.directory, record.source.directory),
      "Mounted source overlaps runtime control directory",
    );
    const lock = await lockWorkspacePath(
      record.source.directory,
      !record.source.access.readOnly,
    );
    releaseSource = lock;
    sourceLockId = lock.id;
    try {
      invariant(
        options.recover?.adoptMountedSource ||
          workspaceManifestFingerprint(
            await workspaceManifest(record.source.directory),
          ) === record.mountedFingerprint,
        "Mounted workspace source changed since checkpoint",
      );
    } catch (error) {
      await releaseSource();
      throw error;
    }
  }
  try {
    let root = record.directory;
    if (
      options.portable &&
      options.retention?.policy === "portable" &&
      record.snapshot
    ) {
      root = join(
        runtime.directory,
        "workspaces",
        `${record.id}-${randomUUID()}`,
        "files",
      );
      await mkdir(dirname(root), { recursive: true, mode: 0o700 });
      await restoreWorkspaceFiles(
        options.retention.transporter,
        record.snapshot,
        root,
      );
      await writeFile(
        join(dirname(root), "owner.json"),
        JSON.stringify({
          format: 1,
          id: record.id,
          namespace: runtime.namespace,
          generation: record.generation,
          fingerprint: record.fingerprint,
        }),
        { flag: "wx", mode: 0o600 },
      );
      for (const conversation of record.conversations ?? []) {
        validateFilePaths([conversation.path]);
        invariant(
          conversation.path.startsWith("conversations/"),
          "Portable conversation is outside its declared control directory",
        );
        const target = await safeDestination(
          runtime.directory,
          conversation.path,
        );
        const temporary = join(dirname(root), `conversation-${randomUUID()}`);
        await restoreArchiveFiles(
          options.retention.transporter,
          conversation.archive,
          temporary,
        );
        const files = await workspaceManifest(temporary);
        invariant(
          files.length === 1 &&
            files[0]?.path ===
              conversation.path.slice(conversation.path.lastIndexOf("/") + 1),
          "Portable conversation archive paths changed",
        );
        const existing = await lstat(target).catch((error) => {
          if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
          )
            return undefined;
          throw error;
        });
        if (existing)
          invariant(
            (await workspaceFingerprint(dirname(target), [files[0].path])) ===
              workspaceManifestFingerprint(files, [files[0].path]),
            "Portable conversation destination changed",
          );
        if (!existing)
          await copyWorkspaceManifest(temporary, dirname(target), files);
        await rm(temporary, { recursive: true });
      }
    }
    invariant(
      inside(join(runtime.directory, "workspaces"), root),
      "Workspace materialization is outside its runtime",
    );
    const rootInfo = await lstat(root);
    if (!options.portable)
      invariant(
        rootInfo.isDirectory() &&
          rootInfo.dev === record.materialization.device &&
          rootInfo.ino === record.materialization.inode,
        "Workspace materialization was replaced",
      );
    const owner = await workspaceOwner(join(dirname(root), "owner.json"));
    invariant(
      owner &&
        typeof owner === "object" &&
        "id" in owner &&
        owner.id === record.id &&
        "namespace" in owner &&
        owner.namespace === runtime.namespace,
      "Workspace is missing or its ownership changed",
    );
    invariant(
      options.recover?.adoptInterruptedFiles ||
        ("generation" in owner &&
          owner.generation === record.generation &&
          "fingerprint" in owner &&
          owner.fingerprint === record.fingerprint),
      "Workspace settled generation differs from its checkpoint; explicit recovery is required",
    );
    const fingerprint = await workspaceFingerprint(root);
    const ownedLock = await lockWorkspacePath(root, true);
    releaseOwned = ownedLock;
    invariant(
      options.recover?.adoptInterruptedFiles ||
        fingerprint === record.fingerprint,
      "Workspace files changed after the settled generation; explicit recovery is required",
    );
    const restored = {
      ...record,
      preparation: "ready" as const,
      owner: { nonce: randomUUID(), state: "open" as const },
      locks: {
        materialization: ownedLock.id,
        ...(sourceLockId ? { source: sourceLockId } : {}),
      },
      directory: root,
      runtime,
      fingerprint,
      materialization: { device: rootInfo.dev, inode: rootInfo.ino },
      ...(options.recover?.allocationReleased && record.allocation
        ? { allocation: { ...record.allocation, state: "released" as const } }
        : {}),
    };
    const mounted = record.source;
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
      restored,
      {
        source: record.source,
        runtime,
        ...(options.retention ? { retention: options.retention } : {}),
      },
      execution,
      async () => {
        await releaseOwned();
        await releaseSource();
      },
      suspendSourceForPublication,
      saved.revision,
    );
    await recordFileWorkspace(workspace);
    return workspace;
  } catch (error) {
    await releaseOwned();
    await releaseSource();
    throw error;
  }
}
