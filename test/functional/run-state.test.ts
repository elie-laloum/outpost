import assert from "node:assert/strict";
import { test } from "node:test";
import { join } from "node:path";
import {
  createLocalTransport,
  createObservationHub,
  createRunObserver,
  readRun,
  watchRun,
  defineWorkflow,
  defineTask,
  defineIsolatedTask,
  createWorkflowCheckpointStore,
  dispatch,
  TransportConflict,
  inspectRecovery,
  planRecoveryRetention,
} from "../../src/index.ts";
import type { Transport, RunEvent } from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { s3Fixture } from "../fixtures/s3-transport-server.ts";
import { repository, scripted, emit } from "../helpers.ts";
import { jsonBytes } from "../../src/infrastructure/transport-json.ts";

async function collect(events: AsyncIterable<RunEvent>) {
  const values: RunEvent[] = [];
  for await (const event of events) values.push(event);
  return values;
}
const tokens = { input: 12, cached: 2, output: 5 };
for (const backend of ["local", "s3"] as const) {
  test(`${backend}: read a running workflow, watch concurrently and resume a cursor after completion`, async (t) => {
    const root = await repository(t);
    const transporter =
      backend === "local"
        ? createLocalTransport({ directory: join(root, "store") })
        : (await s3Fixture(t)).transporter;
    await using sink = await createRunObserver({
      transporter,
      id: "nightly",
      kind: "workflow",
    });
    const observation = createObservationHub({
      sinks: [sink],
      deliveryTimeoutMs: 20_000,
    });
    let unblock!: () => void;
    const blocked = new Promise<void>((resolve) => {
      unblock = resolve;
    });
    let entered!: () => void;
    const ready = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const first = defineTask({
      key: "first",
      async perform(context) {
        context.reportUsage(tokens);
        entered();
        await blocked;
      },
    });
    const second = defineTask({
      key: "second",
      after: [first],
      perform: () => "ok",
    });
    const execution = defineWorkflow("nightly", [first, second]).start({
      observation,
    });
    await ready;
    await observation.flush();
    const active = await readRun({ transporter, id: "nightly" });
    assert.ok(active);
    assert.equal(active.status, "running");
    assert.deepEqual(
      active.tasks.map((task) => [task.key, task.status]),
      [
        ["first", "active"],
        ["second", "waiting"],
      ],
    );
    assert.deepEqual(active.usage, tokens);
    const following = collect(
      watchRun({ transporter, id: "nightly", from: active.seq, pollMs: 5 }),
    );
    unblock();
    const result = await execution;
    await observation.close();
    const finished = await readRun({ transporter, id: "nightly" });
    assert.ok(finished);
    assert.equal(finished.status, "done");
    assert.equal(finished.executionId, result.executionId);
    assert.equal(finished.complete, true);
    assert.deepEqual(finished.accounting, result.usage);
    assert.deepEqual(
      finished.tasks.map((task) => task.status),
      ["done", "done"],
    );
    const events = await following;
    assert.ok(events.length > 0);
    assert.equal(events[0]?.seq, active.seq + 1);
    assert.equal(events.at(-1)?.seq, finished.seq);
    assert.equal(
      (
        await collect(
          watchRun({ transporter, id: "nightly", from: finished.seq }),
        )
      ).length,
      0,
    );
    const all = await collect(watchRun({ transporter, id: "nightly" }));
    assert.equal(all.length, finished.seq);
    assert.deepEqual(
      all.map((event) => event.seq),
      all.map((_, i) => i + 1),
    );
    const inspection = await inspectRecovery({ transporter });
    assert.equal(inspection.complete, true);
    assert.ok(
      inspection.categories.find((category) => category.name === "runs")
        ?.entries.length,
    );
    const plan = await planRecoveryRetention({
      transporter,
      policy: { version: 1, scopes: ["closed-logs"], minAgeMs: 0 },
    });
    assert.ok(
      plan.entries
        .filter((entry) => entry.category === "runs")
        .every((entry) => !entry.eligible),
    );
  });
}

test("real local dispatches project agent, named branches, commits and independent workflow usage", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  await using sink = await createRunObserver({
    transporter,
    id: "parallel",
    kind: "workflow",
  });
  const observation = createObservationHub({ sinks: [sink] });
  const tasks = ["left", "right"].map((key) =>
    defineIsolatedTask({
      key,
      request: () => ({
        repository: root,
        branch: { mode: "named" as const, name: key },
        sandboxProvider: createLocalSandboxProvider(),
        logging: false as const,
        agent: scripted(
          `import {writeFileSync} from 'node:fs'; import {execFileSync} from 'node:child_process'; writeFileSync('${key}.txt', 'change'); execFileSync('git', ['add', '.']); execFileSync('git', ['commit', '-m', '${key}']); console.log(JSON.stringify({kind:'usage',tokens:${JSON.stringify(tokens)}})); ${emit("<outpost>done</outpost>")}`,
        ),
        brief: { text: "test" },
      }),
    }),
  );
  const result = await defineWorkflow("parallel", tasks).start({
    observation,
    concurrency: 2,
  });
  result.unwrap();
  assert.deepEqual(result.observerErrors, []);
  const run = await readRun({ transporter, id: "parallel" });
  assert.ok(run);
  assert.equal(run.dispatches.length, 2);
  assert.equal(run.commits.length, 2);
  assert.equal(run.usage.input, 24);
  assert.ok(
    run.dispatches.every(
      (dispatch) =>
        dispatch.agent === "fixture" &&
        dispatch.completed &&
        dispatch.status === "done" &&
        dispatch.commits.length === 1 &&
        dispatch.branch === dispatch.taskKey,
    ),
  );
});

test("dispatch failure remains classified and observer failures cannot change success", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  await using sink = await createRunObserver({
    transporter,
    id: "failure",
    kind: "dispatch",
  });
  const observation = createObservationHub({ sinks: [sink] });
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: scripted("process.exit(7)"),
      brief: { text: "test" },
      logging: false,
      observation,
    }),
  );
  const run = await readRun({ transporter, id: "failure" });
  assert.equal(run?.status, "failed");
  assert.equal(run?.errors[0]?.code, "process");
  assert.ok(run?.errors[0]?.message);
  const broken: Transport = {
    ...transporter,
    async write(key, bytes, condition) {
      if (key.includes("/events/")) throw new Error("storage unavailable");
      return transporter.write(key, bytes, condition);
    },
  };
  const failedSink = await createRunObserver({
    transporter: broken,
    id: "broken",
    kind: "dispatch",
  });
  const observed = createObservationHub({ sinks: [failedSink] });
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: scripted(emit("<outpost>done</outpost>")),
    brief: { text: "test" },
    observation: observed,
    logging: false,
  });
  assert.equal(result.completed, true);
  assert.ok(result.observerErrors?.length);
  await assert.rejects(failedSink.close(), /storage unavailable/);
  assert.equal(failedSink.errors.length, 1);
});

test("settled checkpoint resumes retain cumulative usage, completed tasks and persistent event sequence", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  const first = defineTask({
    key: "first",
    perform(context) {
      context.reportUsage(tokens);
      return "done";
    },
  });
  const gate = defineTask({
    key: "gate",
    after: [first],
    gate: { kind: "approval", prompt: "Approve?", actors: ["reviewer"] },
    perform: () => "approved",
  });
  const workflow = defineWorkflow("gated", [first, gate]);
  const checkpoint = {
    store: createWorkflowCheckpointStore({ transporter }),
    runId: "nightly",
    version: "1",
  };
  let cursor = 0;
  let executionId = "";
  let requestId = "";
  {
    await using sink = await createRunObserver({
      transporter,
      id: "nightly",
      kind: "workflow",
    });
    const result = await workflow.start({
      checkpoint,
      observation: createObservationHub({ sinks: [sink] }),
    });
    assert.equal(result.status, "paused");
    const run = await readRun({ transporter, id: "nightly" });
    assert.ok(run);
    assert.equal(run.status, "paused");
    cursor = run.seq;
    executionId = result.executionId;
    requestId = result.tasks.find((task) => task.key === "gate")!.pause!.id;
  }
  {
    await using sink = await createRunObserver({
      transporter,
      id: "nightly",
      kind: "workflow",
      resume: true,
    });
    const result = await workflow.start({
      checkpoint,
      decisions: [
        {
          key: "gate",
          actor: "reviewer",
          action: "approve",
          executionId,
          requestId,
          reason: "reviewed",
        },
      ],
      observation: createObservationHub({ sinks: [sink] }),
    });
    assert.equal(result.status, "done");
    const run = await readRun({ transporter, id: "nightly" });
    assert.equal(run?.executionId, executionId);
    assert.equal(run?.complete, true);
    assert.deepEqual(run?.usage, tokens);
    assert.deepEqual(run?.tasks[0]?.usage, tokens);
    assert.equal(
      (
        await collect(watchRun({ transporter, id: "nightly", from: cursor }))
      ).at(-1)?.seq,
      run?.seq,
    );
  }
});

test("heartbeats expire without mutating storage; terminal runs never become abandoned", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  t.mock.timers.enable({ apis: ["Date", "setInterval"], now: Date.now() });
  const sink = await createRunObserver({
    transporter,
    id: "heartbeat",
    kind: "dispatch",
    heartbeatMs: 10,
    abandonAfterMs: 30,
  });
  const original = await readRun({ transporter, id: "heartbeat" });
  t.mock.timers.tick(20);
  await sink.flush?.();
  const live = await readRun({ transporter, id: "heartbeat" });
  assert.ok(Date.parse(live!.heartbeatAt) > Date.parse(original!.heartbeatAt));
  await sink.close();
  const before = await transporter.read("runs/heartbeat/index");
  t.mock.timers.tick(31);
  const expired = await readRun({ transporter, id: "heartbeat" });
  assert.equal(expired?.status, "abandoned");
  assert.equal(expired?.complete, false);
  assert.deepEqual(
    await collect(watchRun({ transporter, id: "heartbeat" })),
    [],
  );
  assert.equal(
    (await transporter.read("runs/heartbeat/index"))?.revision,
    before?.revision,
  );
  await using done = await createRunObserver({
    transporter,
    id: "done",
    kind: "dispatch",
    heartbeatMs: 10,
    abandonAfterMs: 30,
  });
  const hub = createObservationHub({
    sinks: [done],
    scope: { dispatchId: "d" },
  });
  hub.emit("sandbox", {
    kind: "dispatch-finished",
    status: "done",
    completed: true,
    usage: tokens,
  });
  await hub.close();
  t.mock.timers.tick(100);
  assert.equal((await readRun({ transporter, id: "done" }))?.status, "done");
});

test("conditional creation and updates fence concurrent and stale observers", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  const results = await Promise.allSettled(
    [1, 2].map(() =>
      createRunObserver({ transporter, id: "same", kind: "dispatch" }),
    ),
  );
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  for (const result of results) {
    if (result.status === "rejected") {
      assert.ok(result.reason instanceof TransportConflict);
      continue;
    }
    const entry = await transporter.read("runs/same/index");
    assert.ok(entry);
    await transporter.write(entry.key, entry.bytes, {
      ifRevision: entry.revision,
    });
    await assert.rejects(
      Promise.resolve(
        result.value.observe({
          seq: 1,
          at: new Date().toISOString(),
          source: "sandbox",
          scope: { dispatchId: "d" },
          event: { kind: "dispatch-start" },
        }),
      ),
      TransportConflict,
    );
    await assert.rejects(result.value.close(), TransportConflict);
    assert.equal((await readRun({ transporter, id: "same" }))?.seq, 0);
  }
});

test("watch rejects invalid IDs, cursors, missing events and supports cancellation", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  assert.equal(await readRun({ transporter, id: "missing" }), undefined);
  for (const id of ["", "../x", "a/b", "a".repeat(129)])
    await assert.rejects(readRun({ transporter, id }));
  for (const from of [-1, 0.5, NaN])
    await assert.rejects(
      collect(watchRun({ transporter, id: "missing", from })),
    );
  await assert.rejects(
    collect(watchRun({ transporter, id: "missing" })),
    /does not exist/,
  );
  await using sink = await createRunObserver({
    transporter,
    id: "watch",
    kind: "dispatch",
  });
  await assert.rejects(
    collect(watchRun({ transporter, id: "watch", from: 1 })),
    /ahead/,
  );
  const controller = new AbortController();
  const following = collect(
    watchRun({
      transporter,
      id: "watch",
      signal: controller.signal,
      pollMs: 5,
    }),
  );
  controller.abort(new Error("cancelled"));
  await assert.rejects(following, /cancelled/);
  const hub = createObservationHub({
    sinks: [sink],
    scope: { dispatchId: "d" },
  });
  hub.emit("sandbox", {
    kind: "dispatch-finished",
    status: "done",
    completed: true,
    usage: tokens,
  });
  await hub.close();
  const entry = await transporter.read("runs/watch/events/1");
  assert.ok(entry);
  await transporter.write(
    entry.key,
    jsonBytes({
      seq: 9,
      observationSeq: 1,
      at: new Date().toISOString(),
      source: "sandbox",
      scope: {},
      event: {},
    }),
    { ifRevision: entry.revision },
  );
  await assert.rejects(
    collect(watchRun({ transporter, id: "watch" })),
    /sequence mismatch/,
  );
  const corrupted = await transporter.read(entry.key);
  await transporter.remove(entry.key, { ifRevision: corrupted!.revision });
  await assert.rejects(
    collect(watchRun({ transporter, id: "watch" })),
    /missing/,
  );
});

test("projection detects sequence gaps and preserves redaction", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  await using sink = await createRunObserver({
    transporter,
    id: "partial",
    kind: "dispatch",
  });
  const at = new Date().toISOString();
  await sink.observe({
    seq: 2,
    at,
    source: "agent",
    scope: { dispatchId: "d" },
    event: { kind: "text", text: "gap" },
  });
  assert.equal(
    (await readRun({ transporter, id: "partial" }))?.complete,
    false,
  );
  const other = await createRunObserver({
    transporter,
    id: "private",
    kind: "dispatch",
  });
  const hub = createObservationHub({
    sinks: [other],
    redact: [/secret/g],
    scope: { dispatchId: "d" },
  });
  hub.emit("sandbox", {
    kind: "dispatch-finished",
    status: "failed",
    completed: false,
    usage: tokens,
    error: { code: "process", message: "secret" },
  });
  await hub.close();
  await other.close();
  assert.ok(
    !JSON.stringify(await readRun({ transporter, id: "private" })).includes(
      "secret",
    ),
  );
  assert.ok(
    !JSON.stringify(
      await collect(watchRun({ transporter, id: "private" })),
    ).includes("secret"),
  );
});

test("heartbeat storage failures stop publication and remain visible after close", async (t) => {
  const root = await repository(t);
  const storage = createLocalTransport({ directory: join(root, "store") });
  let fail = false;
  const transporter: Transport = {
    ...storage,
    async write(key, bytes, options) {
      if (fail) throw new Error("heartbeat unavailable");
      return storage.write(key, bytes, options);
    },
  };
  t.mock.timers.enable({ apis: ["Date", "setInterval"], now: Date.now() });
  const receiver = await createRunObserver({
    transporter,
    id: "heartbeat-failure",
    kind: "workflow",
    heartbeatMs: 10,
    abandonAfterMs: 30,
  });
  fail = true;
  t.mock.timers.tick(10);
  await assert.rejects(
    Promise.resolve(receiver.flush?.()),
    /heartbeat unavailable/,
  );
  assert.equal(receiver.errors.length, 1);
  t.mock.timers.tick(40);
  assert.equal(
    (await readRun({ transporter, id: "heartbeat-failure" }))?.status,
    "abandoned",
  );
  await assert.rejects(receiver.close(), /heartbeat unavailable/);
  await assert.rejects(receiver.close(), /heartbeat unavailable/);
});

test("observer configuration, bounded reads and settled resume ownership fail explicitly", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  for (const invalid of [
    { heartbeatMs: 0 },
    { heartbeatMs: 10, abandonAfterMs: 10 },
    { abandonAfterMs: 2_147_483_648 },
  ])
    await assert.rejects(
      createRunObserver({
        transporter,
        id: "invalid",
        kind: "workflow",
        ...invalid,
      }),
    );
  await assert.rejects(
    createRunObserver({
      transporter,
      id: "missing",
      kind: "workflow",
      resume: true,
    }),
    /does not exist/,
  );
  const active = await createRunObserver({
    transporter,
    id: "active",
    kind: "workflow",
  });
  await assert.rejects(
    createRunObserver({
      transporter,
      id: "active",
      kind: "workflow",
      resume: true,
    }),
    /unsettled/,
  );
  await assert.rejects(readRun({ transporter, id: "active", maxBytes: 1 }));
  await active.close();
  await active.close();
  assert.throws(
    () =>
      active.observe({
        seq: 1,
        at: new Date().toISOString(),
        source: "sandbox",
        scope: {},
        event: { kind: "dispatch-start" },
      }),
    /closed/,
  );
});
