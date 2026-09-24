import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readlink } from "node:fs/promises";
import { OutpostError } from "../domain/errors.ts";
import type { FileManifestEntry } from "../domain/sandbox.types.ts";
import { safeDestination } from "./files.ts";

export async function fileManifest(
  root: string,
  path: string,
): Promise<FileManifestEntry> {
  const target = await safeDestination(root, path);
  const info = await lstat(target);
  if (!info.isFile() && !info.isSymbolicLink())
    throw new OutpostError("provider", "Unsupported manifest file type", {
      path,
    });
  const hash = createHash("sha256");
  let size = info.size;
  if (info.isSymbolicLink()) {
    const value = Buffer.from(await readlink(target));
    size = value.length;
    hash.update(value);
  } else {
    for await (const chunk of createReadStream(target)) hash.update(chunk);
  }
  return {
    path,
    kind: info.isSymbolicLink() ? "link" : "file",
    mode: info.mode & 0o777,
    size,
    sha256: hash.digest("hex"),
  };
}

export function sameFile(
  left: FileManifestEntry,
  right: FileManifestEntry,
): boolean {
  return (
    left.path === right.path &&
    left.kind === right.kind &&
    left.mode === right.mode &&
    left.size === right.size &&
    left.sha256 === right.sha256
  );
}

export function sameLocalFile(
  remote: FileManifestEntry,
  local: FileManifestEntry,
): boolean {
  if (process.platform !== "win32") return sameFile(remote, local);
  return sameFile(
    { ...remote, mode: remote.mode & 0o200 },
    { ...local, mode: local.mode & 0o200 },
  );
}

export function validateFilePaths(paths: readonly string[]): void {
  if (
    new Set(paths).size !== paths.length ||
    paths.some(
      (path) =>
        !path ||
        path.includes("\\") ||
        path.includes("\0") ||
        path
          .split("/")
          .some(
            (part) =>
              !part ||
              part === "." ||
              part === ".." ||
              part.toLowerCase() === ".git",
          ),
    )
  )
    throw new OutpostError("provider", "Unsafe or duplicate manifest path");
}

export function parseManifest(
  value: unknown,
  paths: readonly string[],
): FileManifestEntry[] {
  validateFilePaths(paths);
  if (!Array.isArray(value) || value.length !== paths.length)
    throw new OutpostError("provider", "Invalid file manifest");
  return value.map((entry: unknown, index) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      !("path" in entry) ||
      typeof entry.path !== "string" ||
      entry.path !== paths[index] ||
      !("kind" in entry) ||
      (entry.kind !== "file" && entry.kind !== "link") ||
      !("mode" in entry) ||
      typeof entry.mode !== "number" ||
      !Number.isInteger(entry.mode) ||
      entry.mode < 0 ||
      entry.mode > 0o777 ||
      !("size" in entry) ||
      typeof entry.size !== "number" ||
      !Number.isSafeInteger(entry.size) ||
      entry.size < 0 ||
      !("sha256" in entry) ||
      typeof entry.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(entry.sha256)
    )
      throw new OutpostError("provider", "Invalid file manifest entry");
    return {
      path: entry.path,
      kind: entry.kind,
      mode: entry.mode,
      size: entry.size,
      sha256: entry.sha256,
    };
  });
}
