import { lstat, opendir } from "node:fs/promises";
import { basename, join } from "node:path";
import { positive } from "../domain/errors.ts";
import {
  storageCategories,
  storageInventoryDefaults,
} from "./storage-inventory.constants.ts";
import type {
  StorageCategory,
  StorageEntry,
  StorageInventory,
  StorageScan,
  StorageUsage,
} from "./storage-inventory.types.ts";

function usage(): StorageUsage {
  return { bytes: 0, files: 0, directories: 0, symlinks: 0, other: 0 };
}
function addUsage(
  target: StorageUsage,
  incoming: Readonly<StorageUsage>,
): void {
  target.bytes += incoming.bytes;
  target.files += incoming.files;
  target.directories += incoming.directories;
  target.symlinks += incoming.symlinks;
  target.other += incoming.other;
}
function errorCode(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  )
    return error.code;
  return "UNAVAILABLE";
}
async function availableDirectory(
  path: string,
  scan: StorageScan,
): Promise<boolean> {
  try {
    const info = await lstat(path);
    if (info.isDirectory() && !info.isSymbolicLink()) return true;
    scan.issues.push({
      path,
      code: info.isSymbolicLink() ? "SYMLINK_ROOT" : "NOT_DIRECTORY",
    });
  } catch (error) {
    if (errorCode(error) !== "ENOENT")
      scan.issues.push({ path, code: errorCode(error) });
  }
  return false;
}
async function measure(
  path: string,
  scan: StorageScan,
  depth: number,
): Promise<StorageEntry> {
  const startIssues = scan.issues.length;
  const entry: StorageEntry = {
    ...usage(),
    name: basename(path),
    path,
    kind: "unknown",
    complete: true,
  };
  if (scan.remaining === 0) {
    scan.issues.push({ path, code: "ENTRY_LIMIT" });
    return { ...entry, complete: false };
  }
  scan.remaining--;
  try {
    const info = await lstat(path);
    entry.modifiedAt = info.mtime.toISOString();
    if (info.isSymbolicLink())
      return { ...entry, kind: "symlink", symlinks: 1 };
    if (info.isFile())
      return { ...entry, kind: "file", files: 1, bytes: info.size };
    if (!info.isDirectory()) {
      scan.issues.push({ path, code: "UNSUPPORTED_TYPE" });
      return { ...entry, kind: "other", other: 1, complete: false };
    }
    entry.kind = "directory";
    entry.directories = 1;
    if (depth >= storageInventoryDefaults.maxDepth) {
      scan.issues.push({ path, code: "DEPTH_LIMIT" });
      return { ...entry, complete: false };
    }
    for await (const child of await opendir(path)) {
      const nested = await measure(join(path, child.name), scan, depth + 1);
      addUsage(entry, nested);
      if (nested.modifiedAt && nested.modifiedAt > entry.modifiedAt)
        entry.modifiedAt = nested.modifiedAt;
      if (!nested.complete) entry.complete = false;
      if (scan.remaining === 0 && !nested.complete) break;
    }
  } catch (error) {
    scan.issues.push({ path, code: errorCode(error) });
  }
  entry.complete = entry.complete && scan.issues.length === startIssues;
  return entry;
}

export async function storageInventory(
  root: string,
  maxEntries: number = storageInventoryDefaults.maxEntries,
): Promise<StorageInventory> {
  positive(maxEntries, "maxEntries");
  const scan: StorageScan = { remaining: maxEntries, issues: [] };
  const categories: StorageCategory[] = [];
  const total = usage();
  const available = await availableDirectory(root, scan);
  for (const name of storageCategories) {
    const path = join(root, name);
    const entries: StorageEntry[] = [];
    if (available && (await availableDirectory(path, scan))) {
      try {
        for await (const child of await opendir(path)) {
          const entry = await measure(join(path, child.name), scan, 0);
          entries.push(entry);
          addUsage(total, entry);
          if (scan.remaining === 0 && !entry.complete) break;
        }
      } catch (error) {
        scan.issues.push({ path, code: errorCode(error) });
      }
    }
    entries.sort((left, right) =>
      left.name < right.name ? -1 : Number(left.name > right.name),
    );
    categories.push({ name, path, entries });
  }
  return {
    root,
    categories,
    usage: total,
    issues: scan.issues,
    complete: scan.issues.length === 0,
    scannedEntries: maxEntries - scan.remaining,
    maxEntries,
  };
}
