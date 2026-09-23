import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { OutpostError } from "../../domain/errors.ts";
import type { LockOwner } from "./lock.types.ts";

export async function lock(
  root: string,
  key: string,
): Promise<() => Promise<void>> {
  const folder = join(root, ".outpost", "locks");
  await mkdir(folder, { recursive: true });
  const path = join(
    folder,
    `${createHash("sha256").update(key).digest("hex").slice(0, 20)}.json`,
  );
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const file = await open(path, "wx", 0o600);
      await file.writeFile(
        JSON.stringify({ pid: process.pid, nonce: randomUUID() }),
      );
      await file.close();
      return () => rm(path, { force: true });
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code !== "EEXIST") throw cause;
      const owner = JSON.parse(await readFile(path, "utf8")) as LockOwner;
      let alive = true;
      try {
        if (!owner.pid) throw new Error();
        process.kill(owner.pid, 0);
      } catch (error) {
        alive = (error as NodeJS.ErrnoException).code === "EPERM";
      }
      if (alive)
        throw new OutpostError(
          "conflict",
          `Workspace is already in use: ${key}`,
          { lock: path, pid: owner.pid },
        );
      await rm(path, { force: true });
    }
  }
  throw new OutpostError("conflict", "Unable to acquire workspace lock");
}
