import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { captureRecoveryChecksums } from "../../src/application/recovery-checksum-capture.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";

const cli = resolve(import.meta.dirname, "../../src/cli/main.ts");
const root = await realpath(
  await mkdtemp(join(tmpdir(), "outpost-checksum-demo-")),
);
try {
  await mkdir(join(root, "previous-files"));
  const payload = join(root, "previous-files", "draft.txt");
  await writeFile(payload, "draft one");
  for (const name of ["remote.patch", "previous.patch", "previous-index.patch"])
    await writeFile(join(root, name), "");
  const state = {
    previous: "a".repeat(40),
    next: "a".repeat(40),
    previousExtras: ["draft.txt"],
    incoming: [],
  };
  await writeFile(join(root, "state.json"), JSON.stringify(state));
  await captureRecoveryChecksums(root, state);
  console.log(
    "Synthetic transfer: matching checksums, then a same-size payload edit.",
  );
  for (const expected of [0, 1]) {
    if (expected === 1) await writeFile(payload, "draft two");
    const result = await executeProcess({
      executable: process.execPath,
      arguments: [
        cli,
        "recovery",
        "verify",
        "--directory",
        root,
        "--checksums",
      ],
    });
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    console.log(
      `Inspection exit status: ${result.status} (expected ${expected})`,
    );
    if (result.status !== expected)
      throw new Error("Unexpected checksum result");
  }
} finally {
  await rm(root, { recursive: true, force: true, maxRetries: 5 });
}
console.log("Temporary demo removed; the current repository was not modified.");
