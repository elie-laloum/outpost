import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { invariant, recordRecovery } from "../domain/errors.ts";
import type {
  FileWorkspaceRecord,
  WorkspaceFileEntry,
} from "../domain/file-workspace.types.ts";
import { directory, inside } from "../infrastructure/files.ts";
import { validateFilePaths } from "../infrastructure/file-manifest.ts";
import { validateRecipeSchema } from "../infrastructure/recipes/schema.ts";
import {
  fileWorkspaceRecordSchema,
  fileWorkspaceSourceSchema,
} from "../domain/file-workspace.constants.ts";
import {
  canonicalWorkspacePath,
  lockWorkspacePath,
  lockWorkspaceCopySource,
} from "../infrastructure/workspace-lock.ts";
import {
  copyWorkspaceManifest,
  workspaceManifest,
  workspaceManifestFingerprint,
  validateWorkspaceSelection,
} from "../infrastructure/workspace-files.ts";
import {
  restoreWorkspaceFiles,
  snapshotWorkspaceFiles,
} from "../infrastructure/workspace-snapshot.ts";
import { restoreArchiveFiles } from "../infrastructure/transport-archive.ts";
import { safeDestination } from "../infrastructure/files.ts";
import { openWorkspace } from "./workspace.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import { workspaceOutputIdentity } from "./workspace-output-baseline.ts";
import { createFileSandbox, dispatchFiles } from "./file-sandbox.ts";
import type { Workspace } from "./outpost.types.ts";
import type {
  FileWorkspace,
  FileWorkspaceOptions,
  FileWorkspaceState,
  FileWorkspaceRegistration,
  GitWorkspace,
  GitWorkspaceOptions,
  RestoreFileWorkspaceOptions,
} from "./file-workspace.types.ts";
import { workspaces } from "./workspace-registry.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { jsonBytes, jsonObject } from "../infrastructure/transport-json.ts";
import { workspaceFileLimits } from "../infrastructure/workspace-files.constants.ts";
import { readInspectionFile } from "../infrastructure/inspection-file.ts";
import { reserveTransportStorage } from "../infrastructure/transport-reservations.ts";
import type { StorageReservation } from "../infrastructure/storage-reservations.types.ts";
import { createLifecycleHookRunner } from "./lifecycle-hooks.ts";
import { executeProcess } from "../infrastructure/process.ts";
import { makeWorkspaceDirectoriesWritable } from "../infrastructure/workspace-cleanup.ts";

async function workspaceOwner(path: string) {
  const value: unknown = JSON.parse(
    (await readInspectionFile(path, 4096)).toString("utf8"),
  );
  invariant(
    value &&
      typeof value === "object" &&
      "format" in value &&
      value.format === 1 &&
      "id" in value &&
      typeof value.id === "string" &&
      "namespace" in value &&
      typeof value.namespace === "string",
    "Invalid workspace ownership marker",
  );
  return value;
}

export function createWorkspace(
  options: GitWorkspaceOptions,
): Promise<GitWorkspace>;
export function createWorkspace(
  options: FileWorkspaceOptions,
): Promise<FileWorkspace>;
export async function createWorkspace(
  options: GitWorkspaceOptions | FileWorkspaceOptions,
): Promise<Workspace | FileWorkspace> {
  if (!isFileWorkspaceOptions(options)) {
    const { source, ...settings } = options;
    const workspace = await openWorkspace({ ...settings, ...source });
    const runtimeDirectory = join(workspace.repository, ".outpost");
    const session: GitWorkspace = {
      ...workspace,
      kind: "git",
      id: randomUUID(),
      runtime: {
        directory: runtimeDirectory,
        namespace: createHash("sha256")
          .update(workspace.repository)
          .digest("hex")
          .slice(0, 24),
      },
      git: workspace,
    };
    const state = workspaces.get(workspace);
    invariant(state, "Git workspace ownership is unavailable");
    workspaces.set(session, state);
    return session;
  }
  return createFileWorkspace(options);
}

function isFileWorkspaceOptions(
  options: GitWorkspaceOptions | FileWorkspaceOptions,
): options is FileWorkspaceOptions {
  return options.source.kind !== "git";
}

export async function createFileWorkspace(
  options: FileWorkspaceOptions,
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

function managedFileWorkspace(
  record: FileWorkspaceRecord,
  options: FileWorkspaceOptions,
  releaseSource: () => Promise<void>,
  suspendSourceForPublication?: () => Promise<() => Promise<void>>,
  recordRevision?: string,
): FileWorkspace {
  const { id, source, runtime, directory: root } = record;
  const owned = dirname(root);
  const marker = join(owned, "owner.json");
  const state: FileWorkspaceState = {
    options,
    marker,
    inputs: record.inputs ?? [],
    releaseSource,
    ...(suspendSourceForPublication ? { suspendSourceForPublication } : {}),
    publications: new Map(
      (record.publicationBaselines ?? []).map((baseline) => [
        workspaceOutputIdentity(baseline.options),
        baseline,
      ]),
    ),
    active: false,
    closed: false,
    generation: record.generation,
    record,
    recordTransport:
      options.retention?.policy === "portable"
        ? options.retention.transporter
        : createLocalTransport({
            directory: join(runtime.directory, "storage"),
          }),
    ...(recordRevision ? { recordRevision } : {}),
  };
  const workspace: FileWorkspace = {
    id,
    kind: source.kind,
    source,
    directory: root,
    runtime,
    sandbox(settings) {
      return createFileSandbox({ ...settings, workspace });
    },
    dispatch(settings) {
      return dispatchFiles({ ...settings, workspace });
    },
    checkpoint() {
      return checkpointFileWorkspace(workspace);
    },
    async close(settings = {}) {
      invariant(
        !state.active,
        "Close the sandbox before closing its workspace",
      );
      if (state.closed) return state.disposal ?? {};
      const preserve =
        settings.preserve ||
        options.retention?.policy === "local" ||
        options.retention?.policy === "portable";
      const currentRoot = await lstat(root);
      invariant(
        currentRoot.isDirectory() &&
          currentRoot.dev === state.record.materialization.device &&
          currentRoot.ino === state.record.materialization.inode,
        "Workspace materialization was replaced; cleanup requires explicit recovery",
      );
      state.record = {
        ...state.record,
        owner: { ...state.record.owner, state: "released" },
      };
      await recordFileWorkspace(workspace);
      if (!preserve) {
        invariant(
          (await workspaceOwner(marker)).id === id,
          "Workspace ownership changed",
        );
        await makeWorkspaceDirectoriesWritable(owned);
        await rm(owned, { recursive: true });
      }
      await releaseSource();
      state.closed = true;
      state.disposal = preserve ? { retainedDirectory: root } : {};
      return state.disposal;
    },
    async [Symbol.asyncDispose]() {
      await workspace.close();
    },
  };
  fileWorkspaces.set(workspace, state);
  return workspace;
}

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

export async function restoreFileWorkspace(
  record: FileWorkspaceRecord,
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

export async function workspaceFingerprint(
  workspace: FileWorkspace | string,
  paths?: readonly string[],
): Promise<string> {
  return workspaceManifestFingerprint(
    await workspaceManifest(
      typeof workspace === "string" ? workspace : workspace.directory,
      paths,
    ),
    paths,
  );
}
