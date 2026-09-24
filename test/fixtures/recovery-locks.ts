import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { git } from "../../src/infrastructure/git/command.ts";
import { lock } from "../../src/infrastructure/git/lock.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";

const cli = resolve(import.meta.dirname, "../../src/cli/main.ts");
const root = await realpath(
  await mkdtemp(join(tmpdir(), "outpost-lock-demo-")),
);
try {
  await git(root, ["init"]);
  const release = await lock(root, "demo-owner");
  try {
    await writeFile(
      join(root, ".outpost", "locks", "invalid.json"),
      JSON.stringify({ pid: -1 }),
    );
    console.log(
      "Temporary repository: expect one present PID, one unknown/INVALID_PID and CLI exit status 1.",
    );
    const result = await executeProcess({
      executable: process.execPath,
      arguments: [cli, "recovery", "inspect", "--repository", root, "--locks"],
    });
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    console.log(`Inspection exit status: ${result.status}`);
    if (
      result.status !== 1 ||
      !result.stdout.includes(`present | PID ${process.pid}`) ||
      !result.stdout.includes("unknown | INVALID_PID")
    )
      throw new Error("Unexpected lock inspection result");
  } finally {
    await release();
  }
} finally {
  await rm(root, { recursive: true, force: true, maxRetries: 5 });
}
console.log("Temporary demo removed; the current repository was not modified.");
