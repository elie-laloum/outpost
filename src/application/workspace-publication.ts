import { randomUUID } from "node:crypto";
import {
  link,
  lstat,
  mkdir,
  mkdtemp,
  readlink,
  rename,
  symlink,
} from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  matchesGlob,
  resolve,
} from "node:path";
import { invariant, OutpostError, recordRecovery } from "../domain/errors.ts";
import type {
  WorkspaceFileEntry,
  WorkspaceOutputOptions,
  WorkspacePublication,
} from "../domain/file-workspace.types.ts";
import type {
  Transport,
  TransportReference,
} from "../domain/transport.types.ts";
import {
  fileManifest,
  parseManifest,
  validateFilePaths,
} from "../infrastructure/file-manifest.ts";
import { safeDestination, inside } from "../infrastructure/files.ts";
import {
  canonicalWorkspacePath,
  lockWorkspacePath,
  inspectWorkspacePathLocks,
  recoverWorkspacePathLock,
} from "../infrastructure/workspace-lock.ts";
import {
  copyWorkspaceManifest,
  workspaceManifest,
} from "../infrastructure/workspace-files.ts";
import {
  jsonBytes,
  jsonObject,
  readReference,
} from "../infrastructure/transport-json.ts";
import { workspaceFileLimits } from "../infrastructure/workspace-files.constants.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import { recordFileWorkspace } from "./file-workspace.ts";
import type { FileWorkspace } from "./file-workspace.types.ts";
import {
  workspaceOutputIdentity,
  captureWorkspaceOutputBaseline,
} from "./workspace-output-baseline.ts";
import type {
  PublicationJournal,
  PublicationOperation,
  PublicationRecoveryOptions,
} from "./workspace-publication.types.ts";
import {
  planPublicationDirectories,
  applyPublicationDirectories,
  settlePublicationDirectories,
  verifyPublicationDirectories,
  rollbackPublicationDirectories,
  preparePublicationRollback,
} from "./workspace-publication-directories.ts";
import type { PublicationDirectory } from "./workspace-publication.types.ts";

function sameEntry(
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

async function currentEntry(
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

async function installExclusive(
  source: string,
  destination: string,
): Promise<void> {
  if ((await lstat(source)).isSymbolicLink()) {
    await symlink(await readlink(source), destination);
    return;
  }
  await link(source, destination);
}

async function rollbackPublication(
  journal: PublicationJournal,
  save: () => Promise<void>,
): Promise<boolean> {
  let complete = await preparePublicationRollback(journal);
  for (const operation of [...journal.operations].reverse()) {
    if (operation.phase === "pending" || operation.phase === "restored")
      continue;
    try {
      const destination = await safeDestination(
        journal.options.destination,
        operation.path,
      );
      const backup = await safeDestination(journal.backup, operation.path);
      const previous = await currentEntry(journal.backup, operation.path);
      const current = await currentEntry(
        journal.options.destination,
        operation.path,
      );
      if (operation.previous && sameEntry(current, operation.previous)) {
        operation.phase = "restored";
        await save();
        continue;
      }
      if (previous) {
        invariant(
          sameEntry(previous, operation.previous),
          "Quarantined publication entry changed",
        );
        invariant(
          !current || sameEntry(current, operation.incoming),
          "Publication destination changed during rollback",
        );
        if (current) {
          operation.rollbackDisplaced = `rollback-${randomUUID()}`;
          await save();
          const displaced = join(journal.backup, operation.rollbackDisplaced);
          await rename(destination, displaced);
          if (
            !sameEntry(
              await currentEntry(journal.backup, operation.rollbackDisplaced),
              operation.incoming,
            )
          ) {
            await installExclusive(displaced, destination);
            throw new Error(
              "Publication entry changed during rollback displacement",
            );
          }
        }
        await installExclusive(backup, destination);
      } else {
        invariant(
          !operation.previous || sameEntry(current, operation.previous),
          "Publication backup is unavailable",
        );
        if (!operation.previous && current) {
          invariant(
            sameEntry(current, operation.incoming),
            "Created publication entry changed during rollback",
          );
          operation.rollbackDisplaced = `rollback-${randomUUID()}`;
          await save();
          const displaced = join(journal.backup, operation.rollbackDisplaced);
          await rename(destination, displaced);
          if (
            !sameEntry(
              await currentEntry(journal.backup, operation.rollbackDisplaced),
              operation.incoming,
            )
          ) {
            await installExclusive(displaced, destination);
            throw new Error(
              "Created entry changed during rollback displacement",
            );
          }
        }
      }
      operation.phase = "restored";
      await save();
    } catch {
      complete = false;
    }
  }
  complete = (await rollbackPublicationDirectories(journal, save)) && complete;
  journal.state = complete ? "rolled-back" : "recovery-required";
  await save();
  return complete;
}

export async function publishWorkspaceOutputs(
  workspace: FileWorkspace,
  declaration: WorkspaceOutputOptions,
  transporter?: Transport,
): Promise<WorkspacePublication> {
  const state = fileWorkspaces.get(workspace);
  invariant(
    state && !state.closed && !state.active,
    "Publication requires a settled workspace",
  );
  state.active = true;
  try {
    return await applyWorkspacePublication(workspace, declaration, transporter);
  } finally {
    state.active = false;
  }
}

async function applyWorkspacePublication(
  workspace: FileWorkspace,
  declaration: WorkspaceOutputOptions,
  transporter?: Transport,
): Promise<WorkspacePublication> {
  const state = fileWorkspaces.get(workspace)!;
  const destination = await canonicalWorkspacePath(declaration.destination);
  invariant(
    !inside(workspace.directory, destination) &&
      !inside(destination, workspace.directory),
    "Publication overlaps workspace materialization",
  );
  if (
    workspace.source.kind === "directory" &&
    workspace.source.access.mode === "mount" &&
    !workspace.source.access.readOnly
  ) {
    invariant(
      !inside(workspace.source.directory, destination) &&
        !inside(destination, workspace.source.directory),
      "Publication overlaps a writable mounted source",
    );
  }
  const options = { ...declaration, destination };
  let captured = state.publications.get(workspaceOutputIdentity(options));
  if (
    !captured &&
    workspace.source.kind === "directory" &&
    workspace.source.access.mode === "copy" &&
    workspace.source.directory === destination &&
    options.policy === "update"
  ) {
    captured = {
      options,
      expected: state.inputs.filter((entry) =>
        options.paths.some(
          (pattern) =>
            matchesGlob(entry.path, pattern) ||
            entry.path.startsWith(`${pattern}/`),
        ),
      ),
    };
  }
  invariant(
    captured || options.policy === "create",
    "Update publication requires prepareWorkspaceOutputs before execution",
  );
  if (!captured) captured = await captureWorkspaceOutputBaseline(options);
  const overlapsReadOnlySource =
    workspace.source.kind === "directory" &&
    workspace.source.access.mode === "mount" &&
    workspace.source.access.readOnly &&
    (inside(workspace.source.directory, destination) ||
      inside(destination, workspace.source.directory));
  const resumeSource = overlapsReadOnlySource
    ? await state.suspendSourceForPublication?.()
    : undefined;
  let release;
  try {
    release = await lockWorkspacePath(destination, true);
  } catch (error) {
    await resumeSource?.();
    throw error;
  }
  const id = randomUUID();
  const transport = transporter ?? state.recordTransport;
  let reference: TransportReference | undefined;
  let journal: PublicationJournal | undefined;
  const save = async () => {
    invariant(journal, "Publication journal is unavailable");
    reference = await transport.write(
      `publications/${workspace.runtime.namespace}/${id}`,
      jsonBytes(journal),
      { ifRevision: reference?.revision ?? null },
    );
    state.record = {
      ...state.record,
      publications: [
        ...(state.record.publications ?? []).filter(
          (publication) => publication.id !== id,
        ),
        {
          id,
          state: journal.state,
          reference: { key: reference.key, revision: reference.revision },
        },
      ],
    };
    await recordFileWorkspace(workspace);
  };
  try {
    const selected = await workspaceManifest(
      workspace.directory,
      options.paths,
    );
    const entries = selected.filter((entry) => entry.kind !== "directory");
    const directories = await planPublicationDirectories(destination, selected);
    invariant(
      options.policy !== "create" ||
        directories.some((directory) => directory.path === "."),
      "Publication create destination already exists",
    );
    const expected = new Map(
      captured.expected
        .filter((entry) => entry.kind !== "directory")
        .map((entry) => [entry.path, entry]),
    );
    const operations: PublicationOperation[] = [];
    for (const entry of entries) {
      const previous = expected.get(entry.path);
      if (sameEntry(previous, entry)) continue;
      operations.push({
        path: entry.path,
        ...(previous ? { previous } : {}),
        incoming: entry,
        phase: "pending",
      });
    }
    const incomingPaths = new Set(entries.map((entry) => entry.path));
    for (const entry of entries)
      invariant(
        sameEntry(
          await currentEntry(destination, entry.path),
          expected.get(entry.path),
        ),
        `Publication destination changed: ${entry.path}`,
      );
    if (options.deleteMissing)
      for (const previous of expected.values()) {
        if (!incomingPaths.has(previous.path))
          operations.push({ path: previous.path, previous, phase: "pending" });
      }
    for (const operation of operations)
      invariant(
        sameEntry(
          await currentEntry(destination, operation.path),
          operation.previous,
        ),
        `Publication destination changed: ${operation.path}`,
      );
    await mkdir(dirname(destination), { recursive: true });
    const staging = await mkdtemp(
      join(dirname(destination), ".outpost-publication-"),
    );
    const incoming = join(staging, "incoming");
    const backup = join(staging, "backup");
    await mkdir(backup, { mode: 0o700 });
    await copyWorkspaceManifest(workspace.directory, incoming, selected);
    journal = {
      format: 1,
      id,
      workspaceId: workspace.id,
      options,
      staging: incoming,
      backup,
      operations,
      directories,
      outputs: entries,
      lock: { id: release.id, directory: release.directory },
      state: "applying",
    };
    await save();
    await applyPublicationDirectories(journal, save);
    for (const operation of operations) {
      const target = await safeDestination(destination, operation.path);
      await mkdir(dirname(target), { recursive: true });
      if (operation.previous) {
        const quarantined = await safeDestination(backup, operation.path);
        await mkdir(dirname(quarantined), { recursive: true });
        operation.phase = "quarantine-intent";
        await save();
        await rename(target, quarantined);
        invariant(
          sameEntry(
            await currentEntry(backup, operation.path),
            operation.previous,
          ),
          "Publication entry changed before quarantine",
        );
        operation.phase = "quarantined";
        await save();
      }
      operation.phase = "install-intent";
      await save();
      if (operation.incoming)
        await installExclusive(
          await safeDestination(incoming, operation.path),
          target,
        );
      invariant(
        sameEntry(
          await currentEntry(destination, operation.path),
          operation.incoming,
        ),
        "Publication entry changed after installation",
      );
      operation.phase = "installed";
      await save();
    }
    for (const operation of operations)
      invariant(
        sameEntry(
          await currentEntry(destination, operation.path),
          operation.incoming,
        ),
        "Publication verification failed",
      );
    for (const entry of entries)
      invariant(
        sameEntry(await currentEntry(destination, entry.path), entry),
        "Publication output verification failed",
      );
    await settlePublicationDirectories(journal, save);
    await verifyPublicationDirectories(journal);
    journal.state = "complete";
    await save();
    invariant(reference, "Publication reference is unavailable");
    return {
      id,
      destination,
      state: "complete",
      created: operations
        .filter((op) => !op.previous && op.incoming)
        .map((op) => op.path),
      replaced: operations
        .filter((op) => op.previous && op.incoming)
        .map((op) => op.path),
      deleted: operations.filter((op) => !op.incoming).map((op) => op.path),
      reference,
    };
  } catch (cause) {
    if (journal) {
      await rollbackPublication(journal, save).catch(() => {
        if (journal) journal.state = "recovery-required";
      });
      const error = new OutpostError(
        "workspace",
        "Workspace publication failed",
        { publicationId: id, state: journal.state },
        cause,
      );
      recordRecovery(error, {
        publicationId: id,
        reference,
        backup: journal.backup,
      });
      throw error;
    }
    throw cause;
  } finally {
    await release();
    await resumeSource?.();
  }
}

function publicationJournal(value: unknown): PublicationJournal {
  invariant(
    value &&
      typeof value === "object" &&
      "format" in value &&
      value.format === 1 &&
      "id" in value &&
      typeof value.id === "string" &&
      "workspaceId" in value &&
      typeof value.workspaceId === "string" &&
      "options" in value &&
      value.options &&
      typeof value.options === "object" &&
      "destination" in value.options &&
      typeof value.options.destination === "string" &&
      "paths" in value.options &&
      Array.isArray(value.options.paths) &&
      value.options.paths.every((path: unknown) => typeof path === "string") &&
      "policy" in value.options &&
      (value.options.policy === "create" ||
        value.options.policy === "update") &&
      "staging" in value &&
      typeof value.staging === "string" &&
      "backup" in value &&
      typeof value.backup === "string" &&
      "state" in value &&
      (value.state === "applying" ||
        value.state === "complete" ||
        value.state === "rolled-back" ||
        value.state === "recovery-required") &&
      "operations" in value &&
      Array.isArray(value.operations) &&
      value.operations.length <= workspaceFileLimits.entries,
    "Invalid publication journal",
  );
  const options: WorkspaceOutputOptions = {
    destination: value.options.destination,
    paths: value.options.paths,
    policy: value.options.policy,
    ...("deleteMissing" in value.options && value.options.deleteMissing === true
      ? { deleteMissing: true }
      : {}),
  };
  validateFilePaths(options.paths);
  invariant(
    isAbsolute(options.destination) &&
      resolve(options.destination) === options.destination,
    "Invalid publication destination",
  );
  const stagingRoot = dirname(value.staging);
  invariant(
    dirname(stagingRoot) === dirname(options.destination) &&
      /^\.outpost-publication-[A-Za-z0-9]+$/.test(basename(stagingRoot)) &&
      value.staging === join(stagingRoot, "incoming") &&
      value.backup === join(stagingRoot, "backup"),
    "Invalid publication recovery staging",
  );
  const operations = value.operations.map(
    (operation: unknown): PublicationOperation => {
      invariant(
        operation &&
          typeof operation === "object" &&
          "path" in operation &&
          typeof operation.path === "string" &&
          "phase" in operation &&
          (operation.phase === "pending" ||
            operation.phase === "quarantine-intent" ||
            operation.phase === "quarantined" ||
            operation.phase === "install-intent" ||
            operation.phase === "installed" ||
            operation.phase === "restored"),
        "Invalid publication operation",
      );
      validateFilePaths([operation.path]);
      if ("rollbackDisplaced" in operation)
        invariant(
          typeof operation.rollbackDisplaced === "string" &&
            /^rollback-[a-f0-9-]+$/.test(operation.rollbackDisplaced),
          "Invalid rollback quarantine path",
        );
      return {
        path: operation.path,
        phase: operation.phase,
        ...("rollbackDisplaced" in operation &&
        typeof operation.rollbackDisplaced === "string"
          ? { rollbackDisplaced: operation.rollbackDisplaced }
          : {}),
        ...("previous" in operation
          ? {
              previous: parseManifest(
                [operation.previous],
                [operation.path],
              )[0]!,
            }
          : {}),
        ...("incoming" in operation
          ? {
              incoming: parseManifest(
                [operation.incoming],
                [operation.path],
              )[0]!,
            }
          : {}),
      };
    },
  );
  invariant(
    new Set(operations.map((op) => op.path)).size === operations.length,
    "Duplicate publication operations",
  );
  let directories: PublicationDirectory[] | undefined;
  if ("directories" in value) {
    invariant(
      Array.isArray(value.directories) &&
        value.directories.length <= workspaceFileLimits.entries,
      "Invalid publication directories",
    );
    directories = value.directories.map((entry: unknown) => {
      invariant(
        entry &&
          typeof entry === "object" &&
          "path" in entry &&
          typeof entry.path === "string" &&
          "mode" in entry &&
          typeof entry.mode === "number" &&
          Number.isInteger(entry.mode) &&
          entry.mode >= 0 &&
          entry.mode <= 0o777 &&
          "phase" in entry &&
          (entry.phase === "pending" ||
            entry.phase === "create-intent" ||
            entry.phase === "created" ||
            entry.phase === "settled" ||
            entry.phase === "restored"),
        "Invalid publication directory",
      );
      if (entry.path !== ".") validateFilePaths([entry.path]);
      let identity: PublicationDirectory["identity"];
      if ("identity" in entry) {
        invariant(
          entry.identity &&
            typeof entry.identity === "object" &&
            "device" in entry.identity &&
            typeof entry.identity.device === "number" &&
            "inode" in entry.identity &&
            typeof entry.identity.inode === "number",
          "Invalid publication directory identity",
        );
        identity = {
          device: entry.identity.device,
          inode: entry.identity.inode,
        };
      }
      if ("createdMode" in entry)
        invariant(
          typeof entry.createdMode === "number" &&
            Number.isInteger(entry.createdMode) &&
            entry.createdMode >= 0 &&
            entry.createdMode <= 0o777,
          "Invalid publication directory mode",
        );
      return {
        path: entry.path,
        mode: entry.mode,
        phase: entry.phase,
        ...(identity ? { identity } : {}),
        ...("createdMode" in entry && typeof entry.createdMode === "number"
          ? { createdMode: entry.createdMode }
          : {}),
      };
    });
    invariant(
      new Set(directories.map((directory) => directory.path)).size ===
        directories.length,
      "Duplicate publication directory",
    );
  }
  const outputs =
    "outputs" in value
      ? parseManifest(
          value.outputs,
          Array.isArray(value.outputs)
            ? value.outputs.map((entry: unknown) => {
                invariant(
                  entry &&
                    typeof entry === "object" &&
                    "path" in entry &&
                    typeof entry.path === "string",
                  "Invalid publication output",
                );
                return entry.path;
              })
            : [],
        )
      : undefined;
  let lock: PublicationJournal["lock"];
  if ("lock" in value) {
    invariant(
      value.lock &&
        typeof value.lock === "object" &&
        "id" in value.lock &&
        typeof value.lock.id === "string" &&
        /^[a-f0-9-]{36}$/.test(value.lock.id) &&
        "directory" in value.lock &&
        value.lock.directory === options.destination,
      "Invalid publication lock identity",
    );
    lock = { id: value.lock.id, directory: options.destination };
  }
  return {
    format: 1,
    id: value.id,
    workspaceId: value.workspaceId,
    options,
    staging: value.staging,
    backup: value.backup,
    state: value.state,
    operations,
    ...(directories ? { directories } : {}),
    ...(outputs ? { outputs } : {}),
    ...(lock ? { lock } : {}),
  };
}

export async function inspectWorkspacePublication(
  transporter: Transport,
  reference: TransportReference,
): Promise<PublicationJournal> {
  return publicationJournal(
    jsonObject(
      await readReference(
        transporter,
        reference,
        workspaceFileLimits.manifestBytes,
      ),
    ),
  );
}

export async function recoverWorkspacePublication(
  transporter: Transport,
  reference: TransportReference,
  action: "finish" | "rollback",
  options: PublicationRecoveryOptions = {},
): Promise<TransportReference> {
  const journal = await inspectWorkspacePublication(transporter, reference);
  invariant(
    journal.state !== "complete" && journal.state !== "rolled-back",
    "Publication has already settled",
  );
  let current = {
    key: reference.key,
    revision: (
      await transporter.write(reference.key, jsonBytes(journal), {
        ifRevision: reference.revision,
      })
    ).revision,
  };
  if (
    journal.lock &&
    (await inspectWorkspacePathLocks()).some(
      (lock) => lock.id === journal.lock?.id,
    )
  ) {
    invariant(
      options.processesStopped === true,
      "Interrupted publication ownership requires explicit stopped-process authorization",
    );
    await recoverWorkspacePathLock(journal.lock.id, journal.lock.directory, {
      processesStopped: true,
    });
  }
  const release = await lockWorkspacePath(journal.options.destination, true);
  journal.lock = { id: release.id, directory: release.directory };
  const save = async () => {
    current = await transporter.write(current.key, jsonBytes(journal), {
      ifRevision: current.revision,
    });
  };
  try {
    if (action === "rollback") {
      invariant(
        await rollbackPublication(journal, save),
        "Publication rollback requires further recovery",
      );
      return current;
    }
    await applyPublicationDirectories(journal, save);
    for (const operation of journal.operations) {
      invariant(
        operation.phase !== "restored",
        "A restored operation cannot be finished; use a new publication",
      );
      const target = await safeDestination(
        journal.options.destination,
        operation.path,
      );
      const existing = await currentEntry(
        journal.options.destination,
        operation.path,
      );
      if (sameEntry(existing, operation.incoming)) {
        operation.phase = "installed";
        await save();
        continue;
      }
      const backup = await safeDestination(journal.backup, operation.path);
      if (
        operation.previous &&
        !(await currentEntry(journal.backup, operation.path))
      ) {
        invariant(
          sameEntry(existing, operation.previous),
          "Publication destination changed before recovery",
        );
        await mkdir(dirname(backup), { recursive: true });
        operation.phase = "quarantine-intent";
        await save();
        await rename(target, backup);
      }
      invariant(
        sameEntry(
          await currentEntry(journal.backup, operation.path),
          operation.previous,
        ),
        "Publication backup changed before recovery",
      );
      invariant(
        !(await currentEntry(journal.options.destination, operation.path)),
        "Publication destination was recreated",
      );
      operation.phase = "install-intent";
      await save();
      if (operation.incoming) {
        invariant(
          sameEntry(
            await currentEntry(journal.staging, operation.path),
            operation.incoming,
          ),
          "Publication staging changed before recovery",
        );
        await mkdir(dirname(target), { recursive: true });
        await installExclusive(
          await safeDestination(journal.staging, operation.path),
          target,
        );
      }
      invariant(
        sameEntry(
          await currentEntry(journal.options.destination, operation.path),
          operation.incoming,
        ),
        "Publication recovery verification failed",
      );
      operation.phase = "installed";
      await save();
    }
    for (const entry of journal.outputs ?? [])
      invariant(
        sameEntry(
          await currentEntry(journal.options.destination, entry.path),
          entry,
        ),
        "Publication output changed before recovery verification",
      );
    await settlePublicationDirectories(journal, save);
    await verifyPublicationDirectories(journal);
    journal.state = "complete";
    await save();
    return current;
  } finally {
    await release();
  }
}
