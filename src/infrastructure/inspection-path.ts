import { lstat, realpath } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export async function isDirectInspectionPath(path: string): Promise<boolean> {
  let current = resolve(path);
  if ((await realpath(current)) === current) return true;
  if (process.platform !== "win32") return false;
  while (true) {
    if ((await lstat(current)).isSymbolicLink()) return false;
    const parent = dirname(current);
    if (parent === current) return true;
    current = parent;
  }
}
