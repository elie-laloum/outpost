import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { inspectRecovery } from "../../src/index.ts";
import { trackedSandboxLease } from "../../src/application/sandbox-activity.ts";
import { registerResourceActivity } from "../../src/infrastructure/resource-activity.ts";
import { fileManifest } from "../../src/infrastructure/file-manifest.ts";
import { fileBatches } from "../../src/providers/file-batches.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

test("incremental uploads remain visible until the underlying batch settles", async (t) => {
  const root = await repository(t);
  const destination = join(root, "destination");
  await mkdir(destination);
  await writeFile(join(root, "payload.bin"), Buffer.from([0, 255, 128]));
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  const activity = await registerResourceActivity({
    repository: root,
    workspace: root,
    sandboxProvider: "fixture",
    placement: "host",
  });
  const started = deferred();
  const proceed = deferred();
  const transfers = fileBatches(base);
  const lease = trackedSandboxLease(
    {
      ...base,
      fileTransfers: {
        ...transfers,
        async uploadBatch(...args) {
          started.resolve();
          await proceed.promise;
          await transfers.uploadBatch!(...args);
        },
      },
    },
    activity,
  );
  const pending = lease.fileTransfers!.uploadBatch!(
    root,
    [await fileManifest(root, "payload.bin")],
    destination,
  );
  try {
    await started.promise;
    const report = await inspectRecovery({ repository: root, resources: true });
    assert.deepEqual(
      report.resources!.entries[0]!.record!.operations.map(
        ({ kind, count }) => ({ kind, count }),
      ),
      [{ kind: "upload-batch", count: 1 }],
    );
    await assert.rejects(activity.remove(), /unsettled/);
  } finally {
    proceed.resolve();
    await pending;
    await base.release();
  }
  assert.deepEqual(
    await readFile(join(destination, "payload.bin")),
    Buffer.from([0, 255, 128]),
  );
  assert.equal(
    (await inspectRecovery({ repository: root, resources: true })).resources!
      .entries[0]!.record!.operations.length,
    0,
  );
  await activity.remove();
});
