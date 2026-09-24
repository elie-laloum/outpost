import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { lockPath } from "../../src/infrastructure/git/lock.ts";
import { localProcessIdentity } from "../../src/infrastructure/git/process-identity.ts";
import {
  fileWorkflowCheckpointStore,
  task,
  workflow,
} from "../../src/index.ts";
import type { WorkflowCheckpointStore } from "../../src/index.ts";

async function temporary(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-checkpoint-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("checkpoints restore typed JSON and undefined across new task definitions", async (t) => {
  const directory = await temporary(t);
  const checkpoint = {
    store: fileWorkflowCheckpointStore({ directory }),
    runId: "same",
    version: "v1",
  };
  let calls = 0;
  const definitions = () => {
    const source = task({
      key: "source",
      perform: () => {
        calls++;
        return { number: 3, items: [true, null] };
      },
    });
    const empty = task({ key: "empty", after: [source], perform() {} });
    return { source, empty, graph: workflow("persisted", [source, empty]) };
  };
  const initial = definitions();
  const first = await initial.graph.start({ checkpoint });
  first.unwrap();
  const restored = definitions();
  const second = await restored.graph.start({ checkpoint });
  assert.equal(second.executionId, first.executionId);
  assert.deepEqual(second.value(restored.source), {
    number: 3,
    items: [true, null],
  });
  assert.equal(second.value(restored.empty), undefined);
  assert.deepEqual(second.usage, first.usage);
  assert.equal(calls, 1);
});

test("resume is explicit, restores dependency values and accumulates attempts and usage", async (t) => {
  const directory = await temporary(t);
  const checkpoint = {
    store: fileWorkflowCheckpointStore({ directory }),
    runId: "resume",
    version: "v1",
  };
  const source = task({
    key: "source",
    perform(context) {
      context.reportUsage({ input: 2, cached: 0, output: 3 });
      return 4;
    },
  });
  const target = task({
    key: "target",
    after: [source],
    perform(context) {
      context.reportUsage({ input: 1, cached: 0, output: 2 });
      if (context.attempt === 1) throw new Error("interrupted effect");
      return context.value(source) * context.attempt;
    },
  });
  const graph = workflow("resume", [source, target]);
  const first = await graph.start({ checkpoint });
  assert.equal(first.status, "failed");
  await assert.rejects(
    graph.start({ checkpoint }),
    /explicitly authorize replay/,
  );
  const second = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  second.unwrap();
  assert.equal(second.value(target), 8);
  assert.equal(second.tasks[1]?.attempts, 2);
  assert.deepEqual(second.usage, {
    attempts: 3,
    tokens: { input: 4, cached: 0, output: 7 },
  });
});

test("resumed admission uses the cumulative budget", async (t) => {
  const directory = await temporary(t);
  const checkpoint = {
    store: fileWorkflowCheckpointStore({ directory }),
    runId: "budget",
    version: "1",
    resume: "retry-incomplete" as const,
  };
  let calls = 0;
  const graph = workflow("budget", [
    task({
      key: "one",
      perform() {
        calls++;
        throw new Error("failed");
      },
    }),
  ]);
  await graph.start({ checkpoint, budget: { attempts: 1 } });
  const result = await graph.start({ checkpoint, budget: { attempts: 1 } });
  assert.equal(result.status, "failed");
  assert.equal(result.usage.attempts, 1);
  assert.equal(calls, 1);
});

test("incompatible identity and corrupt checkpoint fail before effects", async (t) => {
  const directory = await temporary(t);
  const checkpoint = {
    store: fileWorkflowCheckpointStore({ directory }),
    runId: "identity",
    version: "1",
  };
  const graph = workflow("identity", [task({ key: "one", perform: () => 1 })]);
  await graph.start({ checkpoint });
  await assert.rejects(
    graph.start({ checkpoint: { ...checkpoint, version: "2" } }),
    /incompatible/,
  );
  await assert.rejects(
    workflow("identity", [
      task({ key: "two", perform: () => assert.fail() }),
    ]).start({ checkpoint }),
    /incompatible/,
  );
  const path = join(
    directory,
    (await readdir(directory)).find((name) => name.endsWith(".json"))!,
  );
  await writeFile(path, "{bad");
  await assert.rejects(graph.start({ checkpoint }), SyntaxError);
  await writeFile(path, JSON.stringify({ format: 2 }));
  await assert.rejects(graph.start({ checkpoint }), /incompatible/);
});

test("exclusive run ownership rejects a second runner and releases after completion", async (t) => {
  const directory = await temporary(t);
  const checkpoint = {
    store: fileWorkflowCheckpointStore({ directory }),
    runId: "exclusive",
    version: "1",
  };
  let markStarted!: () => void;
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  let finish!: () => void;
  const blocked = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const graph = workflow("exclusive", [
    task({
      key: "one",
      async perform() {
        markStarted();
        await blocked;
        return 1;
      },
    }),
  ]);
  const first = graph.start({ checkpoint });
  await started;
  await assert.rejects(graph.start({ checkpoint }), /already in use/);
  finish();
  (await first).unwrap();
  (await graph.start({ checkpoint })).unwrap();
});

test("write failures cancel and drain active tasks before releasing ownership", async () => {
  let markStarted!: () => void;
  const bothStarted = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  let starts = 0,
    drained = false,
    released = false,
    dependent = false;
  const store: WorkflowCheckpointStore = {
    async acquire() {
      return {
        async read() {
          return undefined;
        },
        async write(checkpoint) {
          if (checkpoint.records.some((record) => record.status === "done"))
            throw new Error("disk full");
        },
        async release() {
          assert.equal(drained, true);
          released = true;
        },
      };
    },
  };
  const fast = task({
    key: "fast",
    async perform() {
      if (++starts === 2) markStarted();
      await bothStarted;
      return 1;
    },
  });
  const slow = task({
    key: "slow",
    async perform(context) {
      if (++starts === 2) markStarted();
      await new Promise<void>((resolve) =>
        context.signal.addEventListener("abort", () => resolve(), {
          once: true,
        }),
      );
      drained = true;
    },
  });
  const child = task({
    key: "child",
    after: [fast],
    perform() {
      dependent = true;
    },
  });
  await assert.rejects(
    workflow("write-failure", [fast, slow, child]).start({
      concurrency: 3,
      checkpoint: { store, runId: "failure", version: "1" },
    }),
    /disk full/,
  );
  assert.equal(released, true);
  assert.equal(dependent, false);
});

test("lossy outputs fail tasks without publishing success", async (t) => {
  const directory = await temporary(t);
  const values: unknown[] = [
    new Date(),
    BigInt(1),
    NaN,
    -0,
    { missing: undefined },
    [undefined],
    new Map(),
    () => 1,
  ];
  const circular: unknown[] = [];
  circular.push(circular);
  values.push(circular);
  for (const [index, value] of values.entries()) {
    const item = task({ key: "lossy", perform: () => value });
    const result = await workflow("lossy", [item]).start({
      checkpoint: {
        store: fileWorkflowCheckpointStore({ directory }),
        runId: String(index),
        version: "1",
      },
    });
    assert.equal(result.status, "failed");
    assert.throws(() => result.value(item));
    assert.match(result.tasks[0]?.error ?? "", /Checkpoint/);
  }
});

for (const unavailableIdentity of [false, true])
  test(
    `a killed process preserves recoverable outputs (unknown identity: ${unavailableIdentity})`,
    { timeout: 10000 },
    async (t) => {
      const directory = await temporary(t);
      const script = join(directory, "run.mjs");
      const module = new URL("../../src/index.ts", import.meta.url).href;
      await writeFile(
        script,
        `import {fileWorkflowCheckpointStore,task,workflow} from ${JSON.stringify(module)};
const first = task({key:'first',perform:()=>42});
const second = task({key:'second',after:[first],async perform(context){context.reportUsage({input:5,cached:0,output:1}); await context.checkpoint?.(); process.send('active'); return new Promise(()=>{setInterval(()=>{},1000)});}});
await workflow('process',[first,second]).start({checkpoint:{store:fileWorkflowCheckpointStore({directory:${JSON.stringify(directory)}}),runId:'process',version:'1'}});`,
      );
      const child = spawn(process.execPath, [script], {
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      });
      t.after(() => child.kill("SIGKILL"));
      await once(child, "message");
      child.kill("SIGKILL");
      await once(child, "exit");
      const first = task({
        key: "first",
        perform: () => assert.fail("completed task replayed"),
      });
      const second = task({
        key: "second",
        after: [first],
        perform: (context) => context.value(first) + context.attempt,
      });
      const restart = () =>
        workflow("process", [first, second]).start({
          checkpoint: {
            store: fileWorkflowCheckpointStore({ directory }),
            runId: "process",
            version: "1",
            resume: "retry-incomplete",
          },
        });
      const path = lockPath(directory, "workflow:process");
      if (unavailableIdentity)
        await writeFile(
          path,
          JSON.stringify({ pid: child.pid, nonce: "test-unknown-owner" }),
        );
      if (unavailableIdentity || !(await localProcessIdentity())) {
        await assert.rejects(restart(), /ownership is unknown/);
        // The fixture has independently awaited its owned child's exit.
        await rm(path);
      }
      const result = await restart();
      result.unwrap();
      assert.equal(result.value(second), 44);
      assert.equal(result.usage.attempts, 3);
      assert.equal(result.usage.tokens.input, 5);
    },
  );

test("checkpoint admission refuses invalid IDs and releases leases after read failure", async (t) => {
  const directory = await temporary(t);
  const store = fileWorkflowCheckpointStore({ directory });
  const graph = workflow("validate", []);
  await assert.rejects(
    graph.start({ checkpoint: { store, runId: " ", version: "1" } }),
    /must not be empty/,
  );
  await assert.rejects(
    graph.start({ checkpoint: { store, runId: "id", version: " " } }),
    /must not be empty/,
  );
  await assert.rejects(store.acquire(" "), /must not be empty/);
  const lease = await store.acquire("id");
  assert.equal(await lease.read(), undefined);
  await lease.release();
  await lease.release();
  await assert.rejects(lease.read(), /released/);
  const next = await store.acquire("id");
  await next.release();
});

test("JSON validation refuses accessor and sparse arrays without invoking getters", async (t) => {
  const directory = await temporary(t);
  let calls = 0;
  const accessor = [1];
  Object.defineProperty(accessor, "0", {
    enumerable: true,
    get() {
      calls++;
      return 1;
    },
  });
  const custom = [1];
  Object.setPrototypeOf(custom, null);
  const object = Object.defineProperty({}, "key", {
    enumerable: true,
    get() {
      calls++;
      return 1;
    },
  });
  const values = [
    accessor,
    custom,
    object,
    new Array(1),
    { [Symbol("key")]: 1 },
  ];
  for (const [index, value] of values.entries()) {
    const result = await workflow("unsafe", [
      task({ key: "value", perform: () => value }),
    ]).start({
      checkpoint: {
        store: fileWorkflowCheckpointStore({ directory }),
        runId: String(index),
        version: "1",
      },
    });
    assert.equal(result.status, "failed");
  }
  assert.equal(calls, 0);
});

test("corrupt records, output envelopes and accounting never replay effects", async () => {
  let saved: unknown,
    calls = 0;
  const store: WorkflowCheckpointStore = {
    async acquire() {
      return {
        async read() {
          return saved;
        },
        async write(value) {
          saved = structuredClone(value);
        },
        async release() {},
      };
    },
  };
  const checkpoint = { store, runId: "corrupt", version: "1" };
  const graph = workflow("corrupt", [
    task({
      key: "one",
      perform() {
        calls++;
        return 1;
      },
    }),
  ]);
  await graph.start({ checkpoint });
  const valid = structuredClone(saved) as Record<string, unknown>;
  const corruptions = [
    { executionId: "" },
    { records: [] },
    { values: {} },
    { records: [{ key: "unknown", status: "done", attempts: 1 }] },
    { records: [{ key: "one", status: "done", attempts: -1 }] },
    { records: [{ key: "one", status: "invalid", attempts: 1 }] },
    { records: [{ key: "one", status: "done", attempts: 1, error: 42 }] },
    { records: [{ key: "one", status: "failed", attempts: 1 }] },
    { values: { one: { kind: "bad" } } },
    { values: { one: { kind: "json" } } },
    {
      values: {
        one: { kind: "json", value: 1 },
        unknown: { kind: "undefined" },
      },
    },
    { usage: { attempts: 2, tokens: { input: 0, cached: 0, output: 0 } } },
    { usage: { attempts: 1, tokens: { input: -1, cached: 0, output: 0 } } },
    {
      usage: {
        attempts: 1,
        tokens: { input: 0, cached: 0, output: 0, cacheCreated: -1 },
      },
    },
  ];
  for (const corruption of corruptions) {
    saved = { ...valid, ...corruption };
    await assert.rejects(graph.start({ checkpoint }), /Invalid/);
  }
  assert.equal(calls, 1);
});

test("checkpoint restart preserves graph identity across host locales", async (t) => {
  const directory = await temporary(t);
  const program = `
    import { fileWorkflowCheckpointStore, task, workflow } from ${JSON.stringify(new URL("../../src/index.ts", import.meta.url).href)};
    const tasks = ["a", "A"].map(key => task({ key, perform() {
      if (process.env.OUTPOST_TEST_RESUME === "1") throw new Error("Completed task replayed");
      return key;
    } }));
    const result = await workflow("portable", tasks).start({ checkpoint: {
      store: fileWorkflowCheckpointStore({ directory: process.env.OUTPOST_TEST_CHECKPOINT }), runId: "portable", version: "v1"
    } });
    result.unwrap();
    console.log(result.value(tasks[0]));
  `;
  const { executeProcess } =
    await import("../../src/infrastructure/process.ts");
  for (const [index, locale] of ["en_US.UTF-8", "da_DK.UTF-8"].entries()) {
    const result = await executeProcess({
      executable: process.execPath,
      arguments: ["--input-type=module", "-e", program],
      variables: {
        LANG: locale,
        LC_ALL: locale,
        OUTPOST_TEST_CHECKPOINT: directory,
        OUTPOST_TEST_RESUME: String(index),
      },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), "a");
  }
});
