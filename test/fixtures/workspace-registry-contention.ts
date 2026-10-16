import {
  lstat,
  mkdir,
  mkdtemp,
  rename,
  rmdir,
  writeFile,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { lockWorkspacePath } from "../../src/infrastructure/workspace-lock.ts";
import { workspaceLocksDirectory } from "../../src/infrastructure/workspace-lock.constants.ts";

const [mode, target] = process.argv.slice(2);
if (!target || !["live", "abandoned", "reused"].includes(mode ?? ""))
  throw new Error(
    "Usage: workspace-registry-contention.ts live|abandoned|reused DIR",
  );
const gate = join(workspaceLocksDirectory, "gate");
await mkdir(workspaceLocksDirectory, { recursive: true, mode: 0o700 });
if (mode === "reused") {
  // A crashed writer's deleted directory left an inode the target now reuses.
  const info = await lstat(target);
  const reused = { device: info.dev, inode: info.ino };
  const id = randomUUID();
  await writeFile(
    join(workspaceLocksDirectory, `${id}.json`),
    JSON.stringify({
      id,
      directory: join(dirname(target), "deleted"),
      writable: true,
      identity: reused,
      ancestors: [reused],
    }),
    { mode: 0o600 },
  );
}
if (mode !== "reused") await mkdir(gate, { mode: 0o700 });
const holder = (async () => {
  if (mode !== "live") return;
  for (const until = Date.now() + 2000; Date.now() < until;) {
    await delay(100);
    // Replacing the empty gate keeps it held while giving it a new identity.
    await rename(await mkdtemp(join(workspaceLocksDirectory, "next-")), gate);
  }
  await rmdir(gate);
})();
const started = Date.now();
try {
  const release = await lockWorkspacePath(target, true);
  await release();
  console.log(
    JSON.stringify({ acquired: true, waitedMs: Date.now() - started }),
  );
} catch (error) {
  console.log(
    JSON.stringify({
      acquired: false,
      message: error instanceof Error ? error.message : String(error),
      waitedMs: Date.now() - started,
    }),
  );
}
await holder;
