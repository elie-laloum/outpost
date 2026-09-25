import { createHash } from "node:crypto";
import { lstat, open, readlink } from "node:fs/promises";
import { dirname } from "node:path";
import type { Stats } from "node:fs";
import { OutpostError } from "../domain/errors.ts";
import { inspectionFileFlags } from "./inspection-file.constants.ts";
import { inspectionHashChunkBytes } from "./inspection-hash.constants.ts";
import { isDirectInspectionPath } from "./inspection-path.ts";
import type { InspectionHash } from "./inspection-hash.types.ts";

function unchanged(before: Stats, after: Stats): boolean {
  return (
    before.dev === after.dev &&
    before.ino === after.ino &&
    before.size === after.size &&
    before.mtimeMs === after.mtimeMs &&
    before.ctimeMs === after.ctimeMs
  );
}

export async function hashInspectionEntry(
  path: string,
  maxBytes = Number.MAX_SAFE_INTEGER,
): Promise<InspectionHash> {
  const before = await lstat(path);
  if (!(await isDirectInspectionPath(dirname(path))))
    throw new Error("Hash path traverses a symlink");
  const hash = createHash("sha256");
  if (before.isSymbolicLink()) {
    const target = await readlink(path, { encoding: "buffer" });
    if (target.length > maxBytes)
      throw new OutpostError("workspace", "Checksum byte limit exceeded", {
        reason: "CHECKSUM_LIMIT",
      });
    if (!unchanged(before, await lstat(path)))
      throw new Error("Hash source changed");
    return {
      kind: "symlink",
      bytes: target.length,
      sha256: hash.update(target).digest("hex"),
    };
  }
  if (!before.isFile()) throw new Error("Hash source is not a regular file");
  if (before.size > maxBytes)
    throw new OutpostError("workspace", "Checksum byte limit exceeded", {
      reason: "CHECKSUM_LIMIT",
    });
  const file = await open(path, inspectionFileFlags);
  try {
    const opened = await file.stat();
    if (!opened.isFile() || !unchanged(before, opened))
      throw new Error("Hash source changed");
    const buffer = Buffer.alloc(inspectionHashChunkBytes);
    let bytes = 0;
    while (bytes < opened.size) {
      const result = await file.read(
        buffer,
        0,
        Math.min(buffer.length, opened.size - bytes),
        bytes,
      );
      if (!result.bytesRead) throw new Error("Hash source truncated");
      bytes += result.bytesRead;
      hash.update(buffer.subarray(0, result.bytesRead));
    }
    if (
      !unchanged(opened, await file.stat()) ||
      !unchanged(opened, await lstat(path))
    )
      throw new Error("Hash source changed");
    return { kind: "file", bytes, sha256: hash.digest("hex") };
  } finally {
    await file.close();
  }
}
