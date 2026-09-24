import assert from "node:assert/strict";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  planRecoveryRetention,
  pruneRecoveryRetention,
} from "../../src/application/recovery-retention.ts";
import { verifyRecoveryTransfer } from "../../src/application/recovery-verification.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { journal } from "../../src/infrastructure/journal.ts";

const root = await realpath(
  await mkdtemp(join(tmpdir(), "outpost-storage-demo-")),
);
try {
  await git(root, ["init", "-b", "main"]);
  await git(root, ["config", "user.name", "Recovery Demo"]);
  await git(root, ["config", "user.email", "demo@example.test"]);
  await writeFile(join(root, "example.txt"), "before\n");
  await git(root, ["add", "example.txt"]);
  await git(root, ["commit", "-m", "Initial"]);
  const commit = (await git(root, ["rev-parse", "HEAD"])).trim();
  const transfer = join(root, ".outpost", "recovery", "transfer");
  await mkdir(transfer, { recursive: true });
  await writeFile(join(root, "example.txt"), "after\n");
  await git(root, [
    "diff",
    "--binary",
    `--output=${join(transfer, "remote.patch")}`,
  ]);
  for (const name of ["previous.patch", "previous-index.patch"])
    await writeFile(join(transfer, name), "");
  await writeFile(
    join(transfer, "state.json"),
    JSON.stringify({
      previous: commit,
      next: commit,
      previousExtras: [],
      incoming: [],
    }),
  );
  const verification = await verifyRecoveryTransfer(transfer, {
    restorability: true,
    repository: root,
  });
  assert.equal(verification.complete, true, JSON.stringify(verification));
  console.log("Actual patch applicability passed in an isolated clone.");
  const log = await journal(root);
  log.record({ kind: "text", text: "temporary diagnostic" });
  await log.close();
  const plan = await planRecoveryRetention({
    repository: root,
    policy: { version: 1, scopes: ["closed-logs"], minAgeMs: 0, maxBytes: 0 },
  });
  assert.equal(plan.entries.filter((entry) => entry.eligible).length, 1);
  console.log(
    `Dry run: one closed log eligible; projected quota ${plan.quota}.`,
  );
  const result = await pruneRecoveryRetention(plan);
  assert.equal(result.removed.length, 1);
  assert.equal(result.after.quota, "exceeded");
  console.log(
    "Explicit prune removed the closed log; protected transfer data still exceeds zero-byte quota.",
  );
} finally {
  await rm(root, { recursive: true, force: true, maxRetries: 5 });
}
console.log(
  "Temporary demonstration removed; the current repository was unchanged.",
);
