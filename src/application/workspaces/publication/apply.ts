import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rename } from "node:fs/promises";
import { dirname, join, matchesGlob } from "node:path";
import {
  invariant,
  OutpostError,
  recordRecovery,
} from "../../../domain/errors.ts";
import type {
  WorkspaceOutputOptions,
  WorkspacePublication,
} from "../../../domain/file-workspace.types.ts";
import type {
  Transport,
  TransportReference,
} from "../../../domain/transport.types.ts";
import { inside, safeDestination } from "../../../infrastructure/files.ts";
import { jsonBytes } from "../../../infrastructure/transport-json.ts";
import {
  copyWorkspaceManifest,
  workspaceManifest,
} from "../../../infrastructure/workspace-files.ts";
import {
  canonicalWorkspacePath,
  lockWorkspacePath,
} from "../../../infrastructure/workspace-lock.ts";
import { recordFileWorkspace } from "../../file-workspace-lifecycle.ts";
import { fileWorkspaces } from "../../file-workspace-registry.ts";
import type { FileWorkspace } from "../../file-workspace.types.ts";
import {
  captureWorkspaceOutputBaseline,
  workspaceOutputIdentity,
} from "../../workspace-output-baseline.ts";
import {
  applyPublicationDirectories,
  planPublicationDirectories,
  settlePublicationDirectories,
  verifyPublicationDirectories,
} from "../../workspace-publication-directories.ts";
import type {
  PublicationJournal,
  PublicationOperation,
} from "../../workspace-publication.types.ts";

import { currentEntry, installExclusive, sameEntry } from "./entries.ts";
import { rollbackPublication } from "./rollback.ts";
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
