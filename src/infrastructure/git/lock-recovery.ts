import { createHash } from "node:crypto";
import { lstat, unlink } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { invariant, OutpostError } from "../../domain/errors.ts";
import { readInspectionFile } from "../inspection-file.ts";
import { lockInspectionDefaults } from "./lock-inspection.constants.ts";
import { observeOwnership } from "./process-identity.ts";
import type {
  LocalLockRecoveryOptions,
  LocalLockSnapshot,
} from "./lock-recovery.types.ts";

export async function inspectLocalLock(
  directory: string,
  name: string,
): Promise<LocalLockSnapshot> {
  invariant(
    /^[a-f0-9]{20}\.json(?:\.reclaim)?$/.test(name),
    "Invalid lock name",
  );
  const folder = resolve(directory);
  invariant(
    basename(folder) === "locks" && basename(dirname(folder)) === ".outpost",
    "Lock directory must be an .outpost/locks directory",
  );
  const path = resolve(folder, name);
  const info = await lstat(path);
  const bytes = await readInspectionFile(
    path,
    lockInspectionDefaults.maxBytes,
    info,
  );
  const revision = createHash("sha256")
    .update(
      JSON.stringify([
        info.dev,
        info.ino,
        info.size,
        info.mtimeMs,
        info.ctimeMs,
      ]),
    )
    .update(bytes)
    .digest("hex");
  let value: unknown;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch {
    return { path, revision };
  }
  if (
    !value ||
    typeof value !== "object" ||
    !("pid" in value) ||
    typeof value.pid !== "number" ||
    !Number.isSafeInteger(value.pid) ||
    value.pid <= 0 ||
    value.pid > lockInspectionDefaults.maxPid
  )
    return { path, revision };
  return {
    path,
    revision,
    pid: value.pid,
    ownership: await observeOwnership(
      value.pid,
      "identity" in value ? value.identity : undefined,
    ),
  };
}

export async function recoverLocalLock(
  directory: string,
  name: string,
  options: LocalLockRecoveryOptions,
): Promise<void> {
  invariant(
    options.processesStopped === true,
    "Lock recovery requires all users of this lock directory to be stopped",
  );
  invariant(
    /^[a-f0-9]{64}$/.test(options.revision),
    "Invalid inspected lock revision",
  );
  const current = await inspectLocalLock(directory, name);
  if (current.revision !== options.revision)
    throw new OutpostError("conflict", "Lock changed since inspection");
  if (current.ownership?.status === "active" || current.pid === process.pid)
    throw new OutpostError("conflict", "Lock owner is still active");
  // Stopped writers are required: filesystems have no conditional unlink operation.
  await unlink(current.path);
}
