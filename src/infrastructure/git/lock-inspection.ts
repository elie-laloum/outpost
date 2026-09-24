import { lstat, open, realpath } from "node:fs/promises";
import { resolve } from "node:path";
import type { Stats } from "node:fs";
import type { StorageEntry, StorageIssue } from "../storage-inventory.types.ts";
import { lockInspectionDefaults } from "./lock-inspection.constants.ts";
import type {
  LockInspection,
  LockInspectionEntry,
  LockInspectionState,
  LockPidProbe,
} from "./lock-inspection.types.ts";

function unchanged(before: Stats, after: Stats): boolean {
  return (
    before.dev === after.dev &&
    before.ino === after.ino &&
    before.size === after.size &&
    before.mtimeMs === after.mtimeMs &&
    before.ctimeMs === after.ctimeMs
  );
}

async function readPid(path: string): Promise<number | undefined> {
  const before = await lstat(path);
  if (!before.isFile() || (await realpath(path)) !== resolve(path))
    throw new Error("Lock path changed");
  if (before.size > lockInspectionDefaults.maxBytes)
    throw new Error("Lock is too large");
  const file = await open(path, lockInspectionDefaults.openFlags);
  try {
    const opened = await file.stat();
    if (!opened.isFile() || !unchanged(before, opened))
      throw new Error("Lock changed");
    const buffer = Buffer.alloc(lockInspectionDefaults.maxBytes + 1);
    let length = 0;
    while (length < buffer.length) {
      const { bytesRead } = await file.read(
        buffer,
        length,
        buffer.length - length,
        length,
      );
      if (!bytesRead) break;
      length += bytesRead;
    }
    if (length > lockInspectionDefaults.maxBytes)
      throw new Error("Lock is too large");
    if (
      !unchanged(opened, await file.stat()) ||
      !unchanged(opened, await lstat(path))
    )
      throw new Error("Lock changed");
    const record: unknown = JSON.parse(buffer.toString("utf8", 0, length));
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
    return pid;
  } finally {
    await file.close();
  }
}

async function inspectEntry(
  entry: StorageEntry,
  probe: LockPidProbe,
): Promise<LockInspectionState> {
  if (entry.kind !== "file") return { state: "skipped", reason: "NOT_FILE" };
  let pid: number | undefined;
  try {
    pid = await readPid(entry.path);
  } catch {
    return { state: "unknown", reason: "LOCK_READ_FAILED" };
  }
  if (pid === undefined) return { state: "unknown", reason: "INVALID_PID" };
  try {
    probe(pid);
    return { state: "present", pid };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ESRCH"
    )
      return { state: "absent", pid };
    return { state: "unknown", pid, reason: "PID_PROBE_FAILED" };
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
