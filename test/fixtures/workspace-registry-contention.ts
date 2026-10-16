import { mkdir, mkdtemp, rename, rmdir } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { lockWorkspacePath } from "../../src/infrastructure/workspace-lock.ts";
import { workspaceLocksDirectory } from "../../src/infrastructure/workspace-lock.constants.ts";

const [mode, target] = process.argv.slice(2);
if (!target || (mode !== "live" && mode !== "abandoned"))
  throw new Error("Usage: workspace-registry-contention.ts live|abandoned DIR");
const gate = join(workspaceLocksDirectory, "gate");
await mkdir(workspaceLocksDirectory, { recursive: true, mode: 0o700 });
await mkdir(gate, { mode: 0o700 });
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
