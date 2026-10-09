import { invariant } from "../domain/errors.ts";
import { fileWorkspaceRecordSchema } from "../domain/file-workspace.constants.ts";
import type { FileWorkspaceRecord } from "../domain/file-workspace.types.ts";
import type { TaskContext } from "../domain/workflow.types.ts";
import { checkpointValue } from "../domain/workflow/checkpoint-value.ts";
import { validateRecipeSchema } from "../infrastructure/recipes/schema.ts";
import { createFileWorkspace, restoreFileWorkspace } from "./file-workspace.ts";
import {
  inspectFileWorkspace,
  recoverFileWorkspace,
} from "./file-workspace-recovery.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import type { FileWorkspaceOptions } from "./file-workspace.types.ts";
import type { TaskFileWorkspace } from "./task-file-workspace.types.ts";

export function assertFileWorkspaceRecord(
  value: unknown,
): asserts value is FileWorkspaceRecord {
  validateRecipeSchema(fileWorkspaceRecordSchema, value, "workspace record");
}

export async function restoreManagedFileWorkspace(
  record: FileWorkspaceRecord,
  options: Omit<FileWorkspaceOptions, "source">,
  sandboxProvider?: SandboxProvider,
) {
  const settings = {
    ...(options.runtime ? { runtime: options.runtime } : {}),
    ...(options.retention ? { retention: options.retention } : {}),
    ...(options.retention?.policy === "portable" ? { portable: true } : {}),
  };
  if (!options.recovery) return restoreFileWorkspace(record, settings);
  const current = await inspectFileWorkspace({
    id: record.id,
    runtime: { ...record.runtime, ...options.runtime },
    ...(options.retention?.policy === "portable"
      ? { transporter: options.retention.transporter }
      : {}),
  });
  invariant(
    current.record.kind === record.kind &&
      (current.record.inputFingerprint === record.inputFingerprint ||
        (record.preparation &&
          record.preparation !== "ready" &&
          options.recovery.adoptInterruptedFiles &&
          JSON.stringify(current.record.source) ===
            JSON.stringify(record.source))),
    "Workspace recovery input identity changed",
  );
  return recoverFileWorkspace(current.record, {
    ...settings,
    ...options.recovery,
    ...(sandboxProvider ? { sandboxProvider } : {}),
    recover: options.recovery,
  });
}

export async function openTaskFileWorkspace(
  context: TaskContext,
  key: string,
  options: FileWorkspaceOptions,
  sandboxProvider?: SandboxProvider,
): Promise<TaskFileWorkspace> {
  const checkpoint = context.workspaceCheckpoint;
  const previous = checkpoint?.read(key);
  const settled = async (record: FileWorkspaceRecord) => {
    const value = checkpointValue(record);
    invariant(value.kind === "json", "Workspace records must be JSON");
    await checkpoint?.write(key, value.value);
  };
  if (previous !== undefined) {
    invariant(
      !(
        previous &&
        typeof previous === "object" &&
        "state" in previous &&
        previous.state === "allocating"
      ),
      "Task workspace allocation requires explicit recovery",
    );
    assertFileWorkspaceRecord(previous);
    invariant(
      previous.kind === options.source.kind,
      "Task workspace source kind changed",
    );
    const workspace = await restoreManagedFileWorkspace(
      previous,
      options,
      sandboxProvider,
    );
    await settled(await workspace.checkpoint());
    return { workspace, settled };
  }
  invariant(
    !options.recovery,
    "Workspace recovery requires a recorded resource",
  );
  await checkpoint?.write(key, {
    format: 1,
    state: "allocating",
    kind: options.source.kind,
  });
  const workspace = await createFileWorkspace(options, settled);
  try {
    await settled(await workspace.checkpoint());
    return { workspace, settled };
  } catch (error) {
    await workspace.close({ preserve: true });
    throw error;
  }
}
