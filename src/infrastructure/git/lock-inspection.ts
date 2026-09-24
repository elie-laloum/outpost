import { observeOwnership } from "./process-identity.ts";
import { readInspectionFile } from "../inspection-file.ts";
import type { StorageEntry, StorageIssue } from "../storage-inventory.types.ts";
import { lockInspectionDefaults } from "./lock-inspection.constants.ts";
import type {
  LockIdentityRecord,
  LockInspection,
  LockInspectionEntry,
  LockInspectionState,
  LockPidProbe,
} from "./lock-inspection.types.ts";

async function readPid(path: string): Promise<LockIdentityRecord | undefined> {
  const record: unknown = JSON.parse(
    (await readInspectionFile(path, lockInspectionDefaults.maxBytes)).toString(
      "utf8",
    ),
  );
  if (!record || typeof record !== "object" || !("pid" in record))
    return undefined;
  const pid = record.pid;
  if (
    typeof pid !== "number" ||
    !Number.isInteger(pid) ||
    pid <= 0 ||
    pid > lockInspectionDefaults.maxPid
  )
    return undefined;
  return {
    pid,
    ...("identity" in record ? { identity: record.identity } : {}),
  };
}

async function inspectEntry(
  entry: StorageEntry,
  probe: LockPidProbe,
): Promise<LockInspectionState> {
  if (entry.kind !== "file") return { state: "skipped", reason: "NOT_FILE" };
  let record: LockIdentityRecord | undefined;
  try {
    record = await readPid(entry.path);
  } catch {
    return { state: "unknown", reason: "LOCK_READ_FAILED" };
  }
  if (record === undefined) return { state: "unknown", reason: "INVALID_PID" };
  const { pid, identity } = record;
  const ownership = await observeOwnership(pid, identity);
  try {
    probe(pid);
    return { state: "present", pid, ownership };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ESRCH"
    )
      return { state: "absent", pid, ownership };
    return { state: "unknown", pid, reason: "PID_PROBE_FAILED", ownership };
  }
}

export async function inspectLocks(
  entries: readonly StorageEntry[],
  probe: LockPidProbe = (pid) => {
    process.kill(pid, 0);
  },
): Promise<LockInspection> {
  const locks: LockInspectionEntry[] = [];
  const issues: StorageIssue[] = [];
  for (const entry of entries) {
    const state = await inspectEntry(entry, probe);
    locks.push({ name: entry.name, path: entry.path, ...state });
    if (state.state === "unknown")
      issues.push({ path: entry.path, code: state.reason });
  }
  return {
    scope: "local-pid",
    complete: issues.length === 0,
    entries: locks,
    issues,
  };
}
