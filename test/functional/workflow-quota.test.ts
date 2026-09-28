import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentTask,
  createSandbox,
  loopTask,
  OutpostError,
  task,
  workflow,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";
import type {
  TaskRecord,
  WorkflowCheckpoint,
  WorkflowCheckpointStore,
  WorkflowEvent,
} from "../../src/index.ts";

function memoryCheckpoint() {
  let saved: WorkflowCheckpoint | undefined;
  const store: WorkflowCheckpointStore = {
    async acquire() {
      return {
        read: async () =>
          saved === undefined ? undefined : structuredClone(saved),
        write: async (checkpoint) => {
          saved = structuredClone(checkpoint);
        },
        release: async () => {},
      };
    },
  };
  return {
    checkpoint: { store, runId: "nightly", version: "1" },
    get saved() {
      return saved!;
    },
    edit(change: (records: TaskRecord[]) => void) {
      change(saved!.records as TaskRecord[]);
    },
  };
}

const limit = (resetAt?: string) =>
  new OutpostError("quota", "usage limit reached", {
    ...(resetAt ? { resetAt } : {}),
  });
const later = (ms: number) => new Date(Date.now() + ms).toISOString();
const record = (tasks: readonly TaskRecord[], key: string) =>
  tasks.find((entry) => entry.key === key)!;

test("a quota failure without a known reset pauses durably and resumes on the next start", async () => {
  const memory = memoryCheckpoint();
  let calls = 0;
  const build = task({
    key: "build",
    perform: () => {
      calls++;
      if (calls === 1) throw limit();
      return "built";
    },
  });
  const deploy = task({ key: "deploy", after: [build], perform: () => "ok" });
  const lint = task({ key: "lint", perform: () => "clean" });
  const graph = workflow("nightly", [build, deploy, lint]);
  const events: WorkflowEvent[] = [];
  const paused = await graph.start({
    checkpoint: memory.checkpoint,
    onQuota: { action: "pause" },
    concurrency: 2,
    observe: (event) => events.push(event),
  });
  assert.equal(paused.status, "paused");
  assert.deepEqual(paused.errors, []);
  const pausedBuild = record(paused.tasks, "build");
  assert.equal(pausedBuild.status, "paused");
  assert.equal(pausedBuild.attempts, 1);
  assert.equal(pausedBuild.quota?.message, "usage limit reached");
  assert.equal(pausedBuild.quota?.resetAt, undefined);
  assert.equal(record(paused.tasks, "deploy").status, "waiting");
  assert.equal(record(paused.tasks, "lint").status, "done");
  assert.ok(
    events.some(
      (event) =>
        event.type === "quota" &&
        event.key === "build" &&
        event.status === "paused",
    ),
  );
  assert.equal(memory.saved.records[0]!.status, "paused");

  const done = await graph.start({ checkpoint: memory.checkpoint });
  done.unwrap();
  assert.equal(calls, 2);
  assert.equal(done.value(build), "built");
  assert.equal(done.value(deploy), "ok");
  assert.equal(record(done.tasks, "build").quota, undefined);
  assert.equal(record(done.tasks, "build").attempts, 2);
  assert.equal(done.usage.attempts, 4);
});

test("a known reset within maxWaitMs waits in process without consuming retries", async () => {
  const memory = memoryCheckpoint();
  let calls = 0;
  const build = task({
    key: "build",
    retry: { attempts: 1 },
    perform: () => {
      calls++;
      if (calls === 1) throw limit(later(40));
      return calls;
    },
  });
  const events: WorkflowEvent[] = [];
  const started = Date.now();
  const result = await workflow("nightly", [build]).start({
    checkpoint: memory.checkpoint,
    onQuota: { action: "pause", maxWaitMs: 5_000 },
    observe: (event) => events.push(event),
  });
  result.unwrap();
  assert.equal(result.value(build), 2);
  assert.ok(Date.now() - started >= 30);
  const quota = events.find((event) => event.type === "quota")!;
  assert.equal(quota.status, "waiting");
  assert.ok(quota.delayMs! > 0 && quota.delayMs! <= 40);
  assert.ok(quota.resetAt);
  assert.equal(events.filter((event) => event.type === "retry").length, 0);
});

test("a reset beyond maxWaitMs stays paused until a start may wait for it", async () => {
  const memory = memoryCheckpoint();
  let calls = 0;
  const resetAt = later(150);
  const build = task({
    key: "build",
    perform: () => {
      calls++;
      if (calls === 1) throw limit(resetAt);
      return "built";
    },
  });
  const graph = workflow("nightly", [build]);
  const first = await graph.start({
    checkpoint: memory.checkpoint,
    onQuota: { action: "pause", maxWaitMs: 10 },
  });
  assert.equal(first.status, "paused");
  assert.equal(record(first.tasks, "build").quota?.resetAt, resetAt);
  const early = await graph.start({
    checkpoint: memory.checkpoint,
    onQuota: { action: "pause", maxWaitMs: 10 },
  });
  assert.equal(early.status, "paused");
  assert.equal(calls, 1);
  const resumed = await graph.start({
    checkpoint: memory.checkpoint,
    onQuota: { action: "pause", maxWaitMs: 5_000 },
  });
  resumed.unwrap();
  assert.ok(Date.now() >= Date.parse(resetAt));
  assert.equal(calls, 2);
});

test("without onQuota a quota error keeps the existing retry and failure behavior", async () => {
  let calls = 0;
  const build = task({
    key: "build",
    retry: { attempts: 2 },
    perform: () => {
      calls++;
      throw limit(later(60_000));
    },
  });
  const result = await workflow("nightly", [build]).start();
  assert.equal(result.status, "failed");
  assert.equal(calls, 2);
  assert.equal(record(result.tasks, "build").quota, undefined);
  assert.ok(
    result.errors[0] instanceof OutpostError &&
      result.errors[0].code === "quota",
  );
});

test("other failures still fail under onQuota", async () => {
  const memory = memoryCheckpoint();
  const build = task({
    key: "build",
    perform: () => {
      throw new OutpostError("process", "compile error");
    },
  });
  const result = await workflow("nightly", [build]).start({
    checkpoint: memory.checkpoint,
    onQuota: { action: "pause", maxWaitMs: 1_000 },
  });
  assert.equal(result.status, "failed");
  assert.equal(record(result.tasks, "build").status, "failed");
});

test("cancelling during a quota wait leaves the task paused and resumable", async () => {
  const memory = memoryCheckpoint();
  const controller = new AbortController();
  let calls = 0;
  const build = task({
    key: "build",
    perform: () => {
      calls++;
      if (calls === 1) {
        setTimeout(() => controller.abort(new Error("stop")), 10);
        throw limit(later(60_000));
      }
      return "built";
    },
  });
  const graph = workflow("nightly", [build]);
  const cancelled = await graph.start({
    checkpoint: memory.checkpoint,
    signal: controller.signal,
    onQuota: { action: "pause", maxWaitMs: 120_000 },
  });
  assert.equal(cancelled.status, "cancelled");
  assert.equal(record(cancelled.tasks, "build").status, "paused");
  memory.edit((records) => {
    records[0]!.quota = { ...records[0]!.quota!, resetAt: later(-1) };
  });
  const done = await graph.start({ checkpoint: memory.checkpoint });
  done.unwrap();
  assert.equal(calls, 2);
});

test("a loop task paused by quota resumes the interrupted phase", async () => {
  const memory = memoryCheckpoint();
  const attempts: number[] = [];
  let checks = 0;
  const fix = loopTask({
    key: "fix",
    maxRounds: 2,
    attempt: (context) => {
      attempts.push(context.round);
      return "patch";
    },
    check: () => {
      checks++;
      if (checks === 1) throw limit();
      return { done: true };
    },
  });
  const graph = workflow("nightly", [fix]);
  const paused = await graph.start({
    checkpoint: memory.checkpoint,
    onQuota: { action: "pause" },
  });
  assert.equal(paused.status, "paused");
  const done = await graph.start({ checkpoint: memory.checkpoint });
  done.unwrap();
  assert.equal(done.value(fix), "patch");
  assert.deepEqual(attempts, [1]);
  assert.equal(checks, 2);
});

test("onQuota requires a checkpoint and a valid policy", async () => {
  const graph = workflow("nightly", [task({ key: "a", perform: () => 1 })]);
  await assert.rejects(
    graph.start({ onQuota: { action: "pause" } }),
    /quota pauses require a checkpoint/,
  );
  const { checkpoint } = memoryCheckpoint();
  await assert.rejects(
    graph.start({
      checkpoint,
      onQuota: { action: "fail" } as unknown as { action: "pause" },
    }),
    /onQuota.action/,
  );
  for (const maxWaitMs of [-1, 1.5, Number.POSITIVE_INFINITY])
    await assert.rejects(
      graph.start({ checkpoint, onQuota: { action: "pause", maxWaitMs } }),
      /onQuota.maxWaitMs/,
    );
});

test("checkpoints reject malformed or misplaced quota records", async () => {
  const cases: ((records: TaskRecord[]) => void)[] = [
    (records) => {
      records[0]!.quota = { requestedAt: "never", message: "limit" };
    },
    (records) => {
      records[0]!.quota = {
        requestedAt: new Date().toISOString(),
        message: "limit",
        resetAt: "soon",
      };
    },
    (records) => {
      Object.assign(records[0]!.quota!, { extra: true });
    },
    (records) => {
      Object.assign(records[0]!.quota!, { conversation: "" });
    },
    (records) => {
      Object.assign(records[0]!.quota!, { branch: 42 });
    },
    (records) => {
      records[0]!.status = "done";
    },
    (records) => {
      delete records[0]!.quota;
    },
  ];
  for (const change of cases) {
    const memory = memoryCheckpoint();
    const build = task({
      key: "build",
      perform: () => {
        throw limit();
      },
    });
    const graph = workflow("nightly", [build]);
    await graph.start({
      checkpoint: memory.checkpoint,
      onQuota: { action: "pause" },
    });
    memory.edit(change);
    await assert.rejects(
      graph.start({ checkpoint: memory.checkpoint }),
      /Invalid .*workflow checkpoint/,
    );
  }
});

test("an agent task that reports a usage limit pauses and resumes the workflow", async (t) => {
  const memory = memoryCheckpoint();
  let limited = true;
  const failure = JSON.stringify({ kind: "failure", message: "Usage limit" });
  await using sandbox = await createSandbox({
    repository: await repository(t),
    sandboxProvider: localSandboxProvider(),
    agent: scripted(() => {
      if (!limited) return emit("done");
      limited = false;
      // The agent dates its reset itself so slow process startup cannot consume the wait.
      return `const resetAt = new Date(Date.now() + 5000).toISOString(); console.log(JSON.stringify({ kind: "quota", message: "limit", resetAt })); console.log(${JSON.stringify(failure)}); process.exit(1);`;
    }),
  });
  const coder = agentTask({
    key: "coder",
    sandbox,
    request: () => ({ brief: { text: "code" } }),
  });
  const run = task({
    key: "run",
    perform: async (context) => (await coder.perform(context)).text,
  });
  const events: WorkflowEvent[] = [];
  const started = Date.now();
  const result = await workflow("nightly", [run]).start({
    checkpoint: memory.checkpoint,
    onQuota: { action: "pause", maxWaitMs: 30_000 },
    observe: (event) => events.push(event),
  });
  result.unwrap();
  assert.equal(result.value(run), "done");
  const pause = events.find((event) => event.type === "quota")!;
  assert.ok(Date.parse(pause.resetAt!) >= started + 5_000);
  assert.equal(pause.status, "waiting");
});
