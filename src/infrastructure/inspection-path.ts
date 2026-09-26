import { lstat, realpath } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export async function isDirectInspectionPath(path: string): Promise<boolean> {
  let current = resolve(path);
  if ((await realpath(current)) === current) return true;
  while (true) {
    const info = await lstat(current);
    // Root-owned POSIX links belong to the system layout, such as /var on macOS.
    if (
      info.isSymbolicLink() &&
      (process.platform === "win32" || info.uid !== 0)
    )
      return false;
    const parent = dirname(current);
    if (parent === current) return true;
    current = parent;
  }
}
