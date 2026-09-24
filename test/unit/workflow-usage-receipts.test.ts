import assert from "node:assert/strict";
import { test } from "node:test";
import { task, workflow } from "../../src/index.ts";
import type {
  TaskContext,
  WorkflowCheckpoint,
  WorkflowCheckpointStore,
} from "../../src/index.ts";

const usage = { input: 3, cached: 0, output: 2 };

test("usage receipts are scoped per task, suppress retries, reject invalid usage, and enforce active ownership", async () => {
  let previous: TaskContext | undefined;
  const first = task({
    key: "first",
    retry: { attempts: 2 },
    perform(context) {
      if (previous)
        assert.throws(
          () => previous!.reportUsageOnce!("same", usage),
          /active/,
        );
      previous = context;
      assert.throws(() => context.reportUsageOnce!("", usage), /receipt/);
      assert.throws(
        () => context.reportUsageOnce!("x".repeat(513), usage),
        /receipt/,
      );
      assert.throws(
        () =>
          context.reportUsageOnce!("invalid-first", { ...usage, input: -1 }),
        /integer/,
      );
      context.reportUsageOnce!("same", usage);
      context.reportUsageOnce!("same", usage);
      if (context.attempt === 1) throw new Error("retry");
    },
  });
  const second = task({
    key: "second",
    perform(context) {
      context.reportUsageOnce!("same", usage);
    },
  });
  const result = await workflow("receipts", [first, second]).start();
  result.unwrap();
  assert.equal(result.usage.tokens.input, 6);
  assert.deepEqual(result.tasks[0]?.usageReceipts, ["same"]);
  assert.throws(() => previous!.reportUsageOnce!("late", usage), /active/);
});

test("budget-triggered snapshots include receipt and usage atomically; restored receipts are validated", async () => {
  const snapshots: WorkflowCheckpoint[] = [];
  let saved: unknown;
  const store: WorkflowCheckpointStore = {
    async acquire() {
      return {
        async read() {
          return saved;
        },
        async write(value) {
          snapshots.push(structuredClone(value));
          saved = structuredClone(value);
        },
        async release() {},
      };
    },
  };
  const run = task({
    key: "run",
    perform(context) {
      context.signal.addEventListener(
        "abort",
        () => {
          void context.checkpoint!();
        },
        { once: true },
      );
      context.reportUsageOnce!("receipt", usage);
    },
  });
  const graph = workflow("atomic", [run]);
  const checkpoint = { store, runId: "one", version: "1" };
  const result = await graph.start({
    checkpoint,
    budget: { usage: { input: 3 } },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.tasks[0]?.status, "cancelled");
  const reported = snapshots.filter(
    (snapshot) => snapshot.usage.tokens.input === 3,
  );
  assert.ok(reported.length);
  for (const snapshot of reported)
    assert.deepEqual(snapshot.records[0]?.usageReceipts, ["receipt"]);
  const intact = structuredClone(snapshots.at(-1)!);
  for (const malformed of [
    "wrong",
    [""],
    ["receipt", "receipt"],
    [42],
    ["x".repeat(513)],
  ]) {
    saved = {
      ...intact,
      records: intact.records.map((record) => ({
        ...record,
        usageReceipts: malformed,
      })),
    };
    await assert.rejects(
      graph.start({
        checkpoint: { ...checkpoint, resume: "retry-incomplete" },
      }),
      /receipt/,
    );
  }
  saved = intact;
  const resumed = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  resumed.unwrap();
  assert.equal(resumed.usage.tokens.input, 3);
});
