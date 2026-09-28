import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  localTransport,
  task,
  taskCacheStore,
  workflow,
  workflowCheckpointStore,
} from "../../src/index.ts";
import type {
  TaskCacheEntry,
  Transport,
  WorkflowCheckpoint,
  WorkflowCheckpointStore,
  WorkflowEvent,
} from "../../src/index.ts";

async function storage(t: { after(callback: () => unknown): void }) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-task-cache-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return localTransport({ directory });
}

async function keys(transporter: Transport): Promise<string[]> {
  const found: string[] = [];
  for await (const entry of transporter.list("task-cache/"))
    found.push(entry.key);
  return found;
}

function entry(fingerprint: string, value: unknown): TaskCacheEntry {
  return {
    format: 1,
    fingerprint,
    workflow: "w",
    task: "t",
    version: "1",
    createdAt: new Date().toISOString(),
    value: { kind: "json", value: value as never },
  };
}

test("separate processes reuse results through a local transport", async (t) => {
  const transporter = await storage(t);
  let runs = 0;
  const run = async () => {
    const events: WorkflowEvent[] = [];
    const item = task({
      key: "review",
      cache: {
        store: taskCacheStore({ transporter }),
        version: "v1",
        key: () => ["commit", "brief"],
      },
      perform: () => ({ run: ++runs }),
    });
    const result = await workflow("w", [item]).start({
      observe: (event) => events.push(event),
    });
    result.unwrap();
    return {
      value: result.value(item),
      cache: events.filter((e) => e.type === "cache").map((e) => e.cache),
    };
  };
  assert.deepEqual(await run(), {
    value: { run: 1 },
    cache: ["miss", "stored"],
  });
  assert.deepEqual(await run(), { value: { run: 1 }, cache: ["hit"] });
  const [stored] = await keys(transporter);
  assert.match(String(stored), /^task-cache\/[0-9a-f]{64}\.json$/);

  const current = await transporter.read(stored!);
  await transporter.write(stored!, Buffer.from("{not json"), {
    ifRevision: current!.revision,
  });
  assert.deepEqual(await run(), {
    value: { run: 2 },
    cache: ["failed", "stored"],
  });
  assert.deepEqual(await run(), { value: { run: 2 }, cache: ["hit"] });
});

test("store validates fingerprints, sizes and entries", async (t) => {
  const transporter = await storage(t);
  const store = taskCacheStore({ transporter, maxBytes: 256 });
  const fingerprint = "a".repeat(64);
  assert.equal(await store.read(fingerprint), undefined);
  await assert.rejects(store.read("../escape"), /SHA-256 hex digest/);
  await assert.rejects(
    store.write({ ...entry(fingerprint, 1), format: 2 as 1 }),
    /Invalid task cache entry/,
  );
  await assert.rejects(
    store.write(entry(fingerprint, "x".repeat(300))),
    /exceeds 256 bytes/,
  );
  assert.throws(
    () => taskCacheStore({ transporter, maxBytes: 0 }),
    /positive integer/,
  );
  await store.write(entry(fingerprint, 1));
  assert.deepEqual((await store.read(fingerprint))?.value, {
    kind: "json",
    value: 1,
  });
  await store.write(entry(fingerprint, 2));
  assert.deepEqual((await store.read(fingerprint))?.value, {
    kind: "json",
    value: 2,
  });
  await transporter.write(
    `task-cache/${"b".repeat(64)}.json`,
    Buffer.from(JSON.stringify(entry(fingerprint, 3))),
    { ifRevision: null },
  );
  await assert.rejects(store.read("b".repeat(64)), /Invalid task cache entry/);
});

test("a concurrent writer keeps its entry", async (t) => {
  const transporter = await storage(t);
  const fingerprint = "c".repeat(64);
  const target = `task-cache/${fingerprint}.json`;
  const competing: Transport = {
    ...transporter,
    async write(key, bytes, options) {
      if (key === target && options.ifRevision === null)
        await transporter.write(
          key,
          Buffer.from(JSON.stringify(entry(fingerprint, "first"))),
          { ifRevision: null },
        );
      return transporter.write(key, bytes, options);
    },
  };
  await taskCacheStore({ transporter: competing }).write(
    entry(fingerprint, "second"),
  );
  const value = await taskCacheStore({ transporter }).read(fingerprint);
  assert.deepEqual(value?.value, { kind: "json", value: "first" });

  const failing: Transport = {
    ...transporter,
    write: () => Promise.reject(new Error("disk full")),
  };
  await assert.rejects(
    taskCacheStore({ transporter: failing }).write(entry("d".repeat(64), 1)),
    /disk full/,
  );
});

function memory() {
  let saved: WorkflowCheckpoint | undefined;
  const store: WorkflowCheckpointStore = {
    async acquire() {
      return {
        async read() {
          return saved === undefined ? undefined : structuredClone(saved);
        },
        async write(value) {
          saved = structuredClone(value);
        },
        async release() {},
      };
    },
  };
  return {
    store,
    read: () => saved!,
    replace(value: WorkflowCheckpoint) {
      saved = value;
    },
  };
}

test("checkpoints persist cache hits and reject inconsistent hit records", async (t) => {
  const transporter = await storage(t);
  const cache = taskCacheStore({ transporter });
  let runs = 0;
  const definitions = () => {
    const review = task({
      key: "review",
      cache: { store: cache, version: "1", key: () => "k" },
      perform: () => ++runs,
    });
    return { review, graph: workflow("w", [review]) };
  };
  const cold = definitions();
  (
    await cold.graph.start({
      checkpoint: {
        store: workflowCheckpointStore({ transporter }),
        runId: "cold",
        version: "1",
      },
    })
  ).unwrap();
  const saved = memory();
  const checkpoint = { store: saved.store, runId: "warm", version: "1" };
  const warm = definitions();
  const hit = await warm.graph.start({ checkpoint });
  hit.unwrap();
  assert.equal(runs, 1);
  assert.equal(saved.read().records[0]?.cacheHit, true);

  const restored = definitions();
  const again = await restored.graph.start({ checkpoint });
  again.unwrap();
  assert.equal(again.value(restored.review), 1);
  assert.equal(again.tasks[0]?.cacheHit, true);

  const snapshot = saved.read();
  saved.replace({
    ...snapshot,
    records: [{ ...snapshot.records[0]!, attempts: 1 }],
    usage: { ...snapshot.usage, attempts: 1 },
  });
  await assert.rejects(
    definitions().graph.start({ checkpoint }),
    /Invalid or incompatible workflow checkpoint/,
  );
});
