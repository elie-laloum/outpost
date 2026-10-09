import { join } from "node:path";
import { invariant } from "../domain/errors.ts";
import { fileWorkspaceRecordSchema } from "../domain/file-workspace.constants.ts";
import type { FileWorkspaceRecord } from "../domain/file-workspace.types.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { jsonBytes, jsonObject } from "../infrastructure/transport-json.ts";
import { workspaceFileLimits } from "../infrastructure/workspace-files.constants.ts";
import { validateRecipeSchema } from "../infrastructure/recipes/schema.ts";
import {
  inspectWorkspacePathLocks,
  recoverWorkspacePathLock,
} from "../infrastructure/workspace-lock.ts";
import { restoreFileWorkspace } from "./file-workspace.ts";
import type {
  FileWorkspaceInspection,
  FileWorkspaceInspectionOptions,
  FileWorkspaceRecoveryOptions,
} from "./file-workspace-recovery.types.ts";
import type { FileWorkspace } from "./file-workspace.types.ts";

export async function inspectFileWorkspace(
  options: FileWorkspaceInspectionOptions,
): Promise<FileWorkspaceInspection> {
  invariant(
    /^[a-f0-9-]{36}$/.test(options.id) &&
      /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(options.runtime.namespace),
    "Invalid workspace inspection identity",
  );
  const transporter =
    options.transporter ??
    createLocalTransport({
      directory: join(options.runtime.directory, "storage"),
    });
  const key = `workspaces/${options.runtime.namespace}/${options.id}/record`;
  const stored = await transporter.read(key, {
    maxBytes: workspaceFileLimits.manifestBytes,
  });
  invariant(stored, "Workspace record was not found");
  const record = validateRecipeSchema<FileWorkspaceRecord>(
    fileWorkspaceRecordSchema,
    jsonObject(stored),
    "workspace record",
  );
  invariant(
    record.id === options.id &&
      record.runtime.namespace === options.runtime.namespace,
    "Workspace record identity mismatch",
  );
  return { record, reference: { key, revision: stored.revision } };
}

export async function recoverFileWorkspace(
  record: FileWorkspaceRecord,
  options: FileWorkspaceRecoveryOptions,
): Promise<FileWorkspace> {
  invariant(
    options.processesStopped === true,
    "Workspace recovery requires explicit stopped-process authorization",
  );
  const runtime = { ...record.runtime, ...options.runtime };
  const transporter =
    options.retention?.policy === "portable"
      ? options.retention.transporter
      : createLocalTransport({ directory: join(runtime.directory, "storage") });
  const inspected = await inspectFileWorkspace({
    runtime,
    id: record.id,
    transporter,
  });
  invariant(
    inspected.reference.revision === options.expectedRevision &&
      inspected.record.owner.nonce === record.owner.nonce,
    "Workspace recovery revision or owner changed",
  );
  const allocation = inspected.record.allocation;
  if (
    allocation &&
    allocation.state !== "released" &&
    !options.recover?.allocationReleased
  ) {
    invariant(
      options.sandboxProvider?.name === allocation.provider &&
        options.sandboxProvider.recover &&
        allocation.resourceId,
      "Unknown allocations require explicit external release; file snapshots do not prove sandbox disposal",
    );
  }
  const claimed = {
    ...inspected.record,
    owner: { ...inspected.record.owner, state: "recovering" as const },
  };
  const revision = (
    await transporter.write(inspected.reference.key, jsonBytes(claimed), {
      ifRevision: options.expectedRevision,
    })
  ).revision;
  if (
    allocation &&
    allocation.state !== "released" &&
    !options.recover?.allocationReleased
  )
    await options.sandboxProvider!.recover!(allocation.resourceId!);
  const locks = await inspectWorkspacePathLocks();
  for (const [id, directory] of [
    [record.locks.materialization, record.directory],
    ...(record.locks.source && record.source.kind === "directory"
      ? [[record.locks.source, record.source.directory]]
      : []),
  ]) {
    invariant(id && directory, "Invalid recorded workspace lock");
    if (locks.some((lock) => lock.id === id))
      await recoverWorkspacePathLock(id, directory, { processesStopped: true });
  }
  return restoreFileWorkspace(claimed, {
    ...options,
    recover: {
      ...options.recover,
      processesStopped: true,
      expectedRevision: revision,
      ...(allocation ? { allocationReleased: true } : {}),
    },
  });
}
