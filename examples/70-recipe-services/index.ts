// Enqueue a YAML recipe, then explicitly start its SQLite worker and inspect the durable result.
// Build Outpost and run with Node.js 24+; all state is temporary and no agent or sandbox is allocated.

import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createRecipeRuntime } from "../../dist/recipes.js";
import { createSqliteTaskQueue } from "../../dist/index.js";

test("explicit worker executes a queued recipe", async () => {
  await using cleanup = new AsyncDisposableStack();
  const directory = await mkdtemp(join(tmpdir(), "outpost-service-example-"));
  cleanup.defer(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await copyFile(resolve(import.meta.dirname, "recipe.yaml"), file);
  const source = await readFile(
    resolve(import.meta.dirname, "outpost.yaml"),
    "utf8",
  );
  await writeFile(
    config,
    source.replace(
      "repository: ../..",
      `repository: ${JSON.stringify(resolve(import.meta.dirname, "../.."))}`,
    ),
  );
  await using publisher = await createRecipeRuntime({ file, config });
  const job = await publisher.enqueue({
    queue: "jobs",
    handler: "message",
    runId: "example",
  });
  assert.equal(job.status, "pending");
  assert.equal(await publisher.status("example"), undefined);
  await using worker = await createRecipeRuntime({ file, config });
  const serving = worker.serve({ service: "worker" });
  cleanup.defer(async () => {
    await worker.close();
    await serving;
  });
  const queue = await createSqliteTaskQueue(
    join(directory, ".outpost/jobs.sqlite"),
  );
  cleanup.defer(() => queue.close());
  for (let attempt = 0; attempt < 200; attempt++) {
    if ((await queue.get(job.id))?.status === "done") break;
    await delay(10);
  }
  assert.equal((await queue.get(job.id))?.status, "done");
  assert.equal(
    (await publisher.status("example"))?.report?.outputs.message?.value,
    "Hello from the queue",
  );
  await worker.close();
  await serving;
});
