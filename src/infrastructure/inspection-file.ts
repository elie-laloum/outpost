import { lstat, open, realpath } from "node:fs/promises";
import { resolve } from "node:path";
import type { Stats } from "node:fs";
import { positive } from "../domain/errors.ts";
import { inspectionFileFlags } from "./inspection-file.constants.ts";

function unchanged(before: Stats, after: Stats): boolean {
  return (
    before.dev === after.dev &&
    before.ino === after.ino &&
    before.size === after.size &&
    before.mtimeMs === after.mtimeMs &&
    before.ctimeMs === after.ctimeMs
  );
}

export async function readInspectionFile(
  path: string,
  maxBytes: number,
): Promise<Buffer> {
  positive(maxBytes, "maxBytes");
  const before = await lstat(path);
  if (!before.isFile() || (await realpath(path)) !== resolve(path))
    throw new Error("Inspection path changed");
  if (before.size > maxBytes) throw new Error("Inspection file is too large");
  const file = await open(path, inspectionFileFlags);
  try {
    const opened = await file.stat();
    if (!opened.isFile() || !unchanged(before, opened))
      throw new Error("Inspection file changed");
    const buffer = Buffer.alloc(maxBytes + 1);
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
    if (length > maxBytes) throw new Error("Inspection file is too large");
    if (
      !unchanged(opened, await file.stat()) ||
      !unchanged(opened, await lstat(path))
    )
      throw new Error("Inspection file changed");
    return buffer.subarray(0, length);
  } finally {
    await file.close();
  }
}
