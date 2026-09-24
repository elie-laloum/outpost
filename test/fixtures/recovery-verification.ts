import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { executeProcess } from "../../src/infrastructure/process.ts";

const cli = resolve(import.meta.dirname, "../../src/cli/main.ts");
const root = await realpath(
  await mkdtemp(join(tmpdir(), "outpost-backup-demo-")),
);
try {
  await mkdir(join(root, "previous-files"));
  await writeFile(join(root, "previous-files", "draft.txt"), "demo draft");
  for (const name of ["remote.patch", "previous.patch", "previous-index.patch"])
    await writeFile(join(root, name), "");
  await writeFile(
    join(root, "state.json"),
    JSON.stringify({
      previous: "a".repeat(40),
      next: "a".repeat(40),
      previousExtras: ["draft.txt"],
      incoming: [],
    }),
  );
  console.log(
    "Synthetic transfer: expected structure only, without commit or restoration validation.",
  );
  for (const expected of [0, 1]) {
    if (expected === 1) await rm(join(root, "previous-files", "draft.txt"));
    console.log(`Expected inspection exit status: ${expected}`);
    const result = await executeProcess({
      executable: process.execPath,
      arguments: [cli, "recovery", "verify", "--directory", root],
    });
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    console.log(`Inspection exit status: ${result.status}`);
    if (result.status !== expected)
      throw new Error("Unexpected verification result");
  }
} finally {
  await rm(root, { recursive: true, force: true, maxRetries: 5 });
}
console.log("Temporary demo removed; the current repository was not modified.");
