import { lstat, open, readdir } from "node:fs/promises";
import { join } from "node:path";
import { invariant } from "../domain/errors.ts";
import { inspectionFileFlags } from "./inspection-file.constants.ts";
import { workspaceFileLimits } from "./workspace-files.constants.ts";

export async function makeWorkspaceDirectoriesWritable(
  root: string,
): Promise<void> {
  if (process.platform === "win32") return;
  let visited = 0;
  const visit = async (path: string): Promise<void> => {
    invariant(
      ++visited <= workspaceFileLimits.entries,
      "Workspace cleanup exceeds its entry limit",
    );
    const before = await lstat(path);
    if (!before.isDirectory() || before.isSymbolicLink()) return;
    const handle = await open(path, inspectionFileFlags);
    try {
      const current = await handle.stat();
      invariant(
        current.isDirectory() &&
          current.dev === before.dev &&
          current.ino === before.ino,
        "Workspace directory changed during cleanup",
      );
      if (
        current.uid === process.geteuid?.() &&
        (current.mode & 0o700) !== 0o700
      )
        await handle.chmod((current.mode & 0o777) | 0o700);
    } finally {
      await handle.close();
    }
    for (const name of await readdir(path)) await visit(join(path, name));
  };
  await visit(root);
}
