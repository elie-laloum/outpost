import assert from "node:assert/strict";
import { test } from "node:test";
import { createObservationHub } from "../../src/index.ts";
import type { Observation } from "../../src/index.ts";
import { observedOperation } from "../../src/domain/observed-operation.ts";

const event = { kind: "text", text: "hello" } as const;

test("siblings share sequence, retain scope and deliver asynchronous events in order", async () => {
  const received: Observation[] = [];
  const hub = createObservationHub({
    sinks: [
      {
        async observe(value) {
          await Promise.resolve();
          received.push(value);
        },
      },
    ],
  });
  const left = hub.child({ taskKey: "left", attempt: 1 });
  left.emit("agent", event);
  hub.child({ taskKey: "right", attempt: 2 }).emit("agent", event);
  left.emit("agent", event);
  await hub.flush();
  assert.deepEqual(
    received.map((value) => value.seq),
    [1, 2, 3],
  );
  assert.deepEqual(
    received.map((value) => value.scope.taskKey),
    ["left", "right", "left"],
  );
  assert.equal(received[1]?.scope.attempt, 2);
  assert.equal(hub.errors.length, 0);
});

test("sink errors, flush failures and mutation cannot affect another sink", async () => {
  const received: Observation[] = [];
  const hub = createObservationHub({
    sinks: [
      {
        observe(value) {
          if (value.event.kind === "text")
            Object.assign(value.event, { text: "changed" });
          throw new Error("sync");
        },
      },
      {
        async observe() {
          throw new Error("async");
        },
        flush() {
          throw new Error("flush");
        },
      },
      {
        observe(value) {
          received.push(value);
        },
      },
    ],
  });
  hub.emit("agent", event);
  await hub.flush();
  assert.deepEqual(received[0]?.event, event);
  assert.equal(hub.errors.length, 3);
});

test("overflow drops newest per slow sink, reports loss and never blocks healthy sinks", async () => {
  const received: number[] = [],
    fast: number[] = [];
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  const hub = createObservationHub({
    capacity: 1,
    sinks: [
      {
        async observe(value) {
          received.push(value.seq);
          await blocked;
        },
      },
      {
        observe(value) {
          fast.push(value.seq);
        },
      },
    ],
  });
  for (let n = 0; n < 4; n++) hub.emit("agent", event);
  release();
  await hub.flush();
  assert.deepEqual(received, [1, 2]);
  assert.deepEqual(fast, [1, 2, 3, 4]);
  assert.equal(hub.dropped, 2);
  assert.match(String(hub.errors[0]), /overflow/);
});

test("an unresponsive sink is disabled after its deadline without concurrent deliveries", async () => {
  let calls = 0;
  const hub = createObservationHub({
    deliveryTimeoutMs: 10,
    sinks: [
      {
        observe() {
          calls++;
          return new Promise(() => {});
        },
      },
    ],
  });
  hub.emit("agent", event);
  hub.emit("agent", event);
  await hub.flush();
  hub.emit("agent", event);
  await hub.flush();
  assert.equal(calls, 1);
  assert.equal(hub.dropped, 2);
  assert.match(String(hub.errors[0]), /timed out/);
});

test("reentrant emissions retain sequence order for every sink", async () => {
  const received: number[] = [];
  const hub = createObservationHub({
    sinks: [
      {
        observe(value) {
          if (value.seq === 1) hub.emit("agent", event);
        },
      },
      {
        observe(value) {
          received.push(value.seq);
        },
      },
    ],
  });
  hub.emit("agent", event);
  await hub.flush();
  assert.deepEqual(received, [1, 2]);
});

test("closing a child flushes and detaches its sinks while siblings remain usable", async () => {
  const own: number[] = [],
    shared: number[] = [];
  const hub = createObservationHub({
    sinks: [
      {
        observe(value) {
          shared.push(value.seq);
        },
      },
    ],
  });
  const child = hub.child({}, [
    {
      async observe(value) {
        own.push(value.seq);
      },
    },
  ]);
  const grandchild = child.child({ pass: 1 });
  grandchild.emit("agent", event);
  await child.close();
  grandchild.emit("agent", event);
  hub.child({}).emit("agent", event);
  await hub.flush();
  assert.deepEqual(own, [1]);
  assert.deepEqual(shared, [1, 2]);
});

test("operation terminals match their start on success and preserve failure identity", async () => {
  const events: Observation[] = [];
  const hub = createObservationHub({
    sinks: [
      {
        observe(value) {
          events.push(value);
        },
      },
    ],
  });
  assert.equal(await observedOperation(hub, "git", "merge", async () => 3), 3);
  const error = new Error("conflict");
  await assert.rejects(
    observedOperation(hub, "git", "merge", async () => {
      throw error;
    }),
    (cause) => cause === error,
  );
  const operations = events.flatMap((value) =>
    value.event.kind === "operation" ? [value.event] : [],
  );
  assert.deepEqual(
    operations.map((value) => value.status),
    ["started", "finished", "started", "failed"],
  );
  assert.equal(operations[0]?.id, operations[1]?.id);
  assert.equal(operations[2]?.id, operations[3]?.id);
  assert.notEqual(operations[0]?.id, operations[2]?.id);
  assert.ok(operations[3]!.durationMs! >= 0);
  assert.equal(
    await observedOperation(undefined, "git", "merge", async () => 4),
    4,
  );
});

test("invalid limits fail early and uncloneable payloads become observer errors", () => {
  assert.throws(() => createObservationHub({ capacity: 0 }), /positive/);
  assert.throws(
    () => createObservationHub({ deliveryTimeoutMs: NaN }),
    /positive/,
  );
  const hub = createObservationHub();
  hub.emit("agent", { kind: "raw", value: () => {} });
  assert.equal(hub.errors.length, 1);
});

test("closing an ancestor detaches descendant sinks and reentrant loops are bounded", async () => {
  let flushes = 0;
  const hub = createObservationHub({ capacity: 5 });
  const child = hub.child({});
  const descendant = child.child({}, [
    {
      observe() {},
      flush() {
        flushes++;
      },
    },
  ]);
  descendant.emit("agent", event);
  await child.close();
  const closedFlushes = flushes;
  await hub.flush();
  assert.equal(flushes, closedFlushes);
  const cyclic = createObservationHub({
    capacity: 5,
    sinks: [
      {
        observe() {
          cyclic.emit("agent", event);
        },
      },
    ],
  });
  cyclic.emit("agent", event);
  await cyclic.flush();
  assert.match(String(cyclic.errors[0]), /Reentrant/);
  assert.ok(cyclic.dropped > 0);
});
