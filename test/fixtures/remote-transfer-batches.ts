import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openWorkspace } from "../../src/index.ts";
import { seedRemote } from "../../src/application/remote-workspace.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { fileBatches } from "../../src/providers/file-batches.ts";
import { local } from "../../src/providers/local.ts";

const root = await mkdtemp(join(tmpdir(), "outpost-transfer-fixture-"));
await git(root, ["init", "-b", "main"]);
await git(root, ["config", "user.name", "Transfer Fixture"]);
await git(root, ["config", "user.email", "fixture@example.test"]);
await writeFile(join(root, "base.txt"), "initial\n");
await git(root, ["add", "."]);
await git(root, ["commit", "-m", "Fixture baseline"]);
const workspace = await openWorkspace({
  repository: root,
  branch: { mode: "named", name: "transfer-fixture" },
});
const remote = join(root, ".outpost", "recovery", "fixture-remote");
await mkdir(remote, { recursive: true });
const base = await local().acquire({
  repository: remote,
  directory: remote,
  gitDirectories: [],
  variables: {},
});
let downloads = 0,
  compressedBytes = 0;
const lease = {
  ...base,
  download: async (...args: Parameters<typeof base.download>) => {
    downloads++;
    if (args[0].endsWith(".json.gz"))
      compressedBytes += (await stat(args[0])).size;
    await base.download(...args);
  },
};
const sync = await seedRemote(workspace, {
  ...lease,
  fileTransfers: fileBatches(lease),
});
try {
  const bytes = Buffer.from(
    Array.from({ length: 1024 * 1024 }, (_, index) => index % 256),
  );
  await writeFile(join(remote, "binary.dat"), bytes);
  await writeFile(join(remote, "text.txt"), "compressed batch\n".repeat(4096));
  await sync.pull();
  const firstPullDownloads = downloads;
  const verified = await base.invoke({
    executable: process.execPath,
    arguments: [
      "-e",
      "const b=require('node:fs').readFileSync('binary.dat');if(b.length!==1048576||b.some((v,i)=>v!==i%256))process.exit(1)",
    ],
  });
  assert.equal(verified.status, 0);
  assert.deepEqual(
    await readFile(join(workspace.directory, "binary.dat")),
    bytes,
  );
  await sync.pull();
  const unchangedPullDownloads = downloads - firstPullDownloads;
  assert.equal(firstPullDownloads, 2);
  assert.equal(unchangedPullDownloads, 1);
  assert.ok(compressedBytes < bytes.length);
  console.log(
    JSON.stringify({
      firstPullDownloads,
      unchangedPullDownloads,
      binaryBytes: bytes.length,
      compressedBytes,
      verified: true,
    }),
  );
} finally {
  await sync.close();
  await base.release();
  await workspace.close({ preserve: true });
  await rm(root, { recursive: true, force: true });
}
