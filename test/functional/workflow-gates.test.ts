import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  defineApprovalTask,
  definePauseTask,
  createWorkflowCheckpointStore,
  defineTask,
  defineWorkflow,
  createLocalTransport,
} from "../../src/index.ts";
import type {
  WorkflowCheckpointStore,
  WorkflowDecision,
  WorkflowEvent,
  WorkflowResult,
} from "../../src/index.ts";

async function setup(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-gates-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return {
    directory,
    checkpoint: {
      store: createWorkflowCheckpointStore({
        transporter: createLocalTransport({ directory: directory }),
      }),
      runId: "release",
      version: "1",
    },
  };
}

const gateOptions = {
  key: "review",
  prompt: "Ship this change?",
  actors: ["maintainer"],
};

function decision(
  result: WorkflowResult,
  action: WorkflowDecision["action"] = "approve",
  key = "review",
): WorkflowDecision {
  return {
    executionId: result.executionId,
    key,
    requestId: result.tasks.find((entry) => entry.key === key)!.pause!.id,
    actor: "maintainer",
    reason: "Reviewed the changes",
    action,
  };
}

test("approval pauses durably, drains independent tasks, and restores values without replay", async (t) => {
  const { checkpoint } = await setup(t);
  let builds = 0,
    deliveries = 0;
  const definition = () => {
    const build = defineTask({
      key: "build",
      perform(context) {
        builds++;
        context.reportUsage({ input: 2, cached: 1, output: 3 });
        return { artifact: "build-42" };
      },
    });
    const review = defineApprovalTask({ ...gateOptions, after: [build] });
    const independent = defineTask({
      key: "independent",
      perform: () => "finished",
    });
    const ship = defineTask({
      key: "ship",
      after: [build, review],
      perform(context) {
        deliveries++;
        return {
          artifact: context.value(build).artifact,
          actor: context.value(review).actor,
        };
      },
    });
    return {
      ship,
      review,
      graph: defineWorkflow("release", [build, review, independent, ship]),
    };
  };
  const first = await definition().graph.start({ checkpoint, concurrency: 3 });
  assert.equal(first.status, "paused");
  assert.throws(() => first.unwrap(), /paused/);
  assert.deepEqual(
    first.tasks.map((entry) => entry.status),
    ["done", "paused", "done", "waiting"],
  );
  assert.equal(first.tasks[1]!.attempts, 0);
  const waiting = await definition().graph.start({ checkpoint });
  assert.equal(waiting.status, "paused");
  assert.deepEqual(waiting.tasks[1]!.pause, first.tasks[1]!.pause);
  assert.deepEqual(waiting.usage, first.usage);
  assert.equal(deliveries, 0);
  const restored = definition();
  const events: WorkflowEvent[] = [];
  const result = await restored.graph.start({
    checkpoint,
    decisions: [decision(first)],
    observe: (event) => events.push(event),
  });
  result.unwrap();
  assert.equal(builds, 1);
  assert.equal(deliveries, 1);
  assert.equal(result.executionId, first.executionId);
  assert.equal(result.usage.attempts, 3);
  assert.deepEqual(result.usage.tokens, first.usage.tokens);
  assert.deepEqual(result.value(restored.ship), {
    artifact: "build-42",
    actor: "maintainer",
  });
  assert.equal(result.value(restored.review).reason, "Reviewed the changes");
  assert.ok(result.value(restored.review).decidedAt);
  assert.equal(events[0]!.type, "start");
  assert.ok(
    events.some((event) => event.key === "review" && event.status === "done"),
  );
  await assert.rejects(
    restored.graph.start({ checkpoint, decisions: [decision(first)] }),
    /Invalid or unauthorized/,
  );
});

test("rejection persists its audit trail and blocks dependents on every restart", async (t) => {
  const { checkpoint } = await setup(t);
  const review = defineApprovalTask(gateOptions);
  const child = defineTask({
    key: "child",
    after: [review],
    perform: () => assert.fail("rejected dependency executed"),
  });
  const graph = defineWorkflow("release", [review, child]);
  const first = await graph.start({ checkpoint });
  const rejected = await graph.start({
    checkpoint,
    decisions: [decision(first, "reject")],
  });
  assert.equal(rejected.status, "failed");
  assert.deepEqual(
    rejected.tasks.map((entry) => entry.status),
    ["rejected", "skipped"],
  );
  assert.equal(rejected.tasks[0]!.decision!.actor, "maintainer");
  assert.match(rejected.tasks[0]!.error!, /Reviewed the changes/);
  assert.throws(() => rejected.value(review), /no successful value/);
  for (const resume of [undefined, "retry-incomplete"] as const) {
    const result = await graph.start({
      checkpoint: { ...checkpoint, ...(resume ? { resume } : {}) },
    });
    assert.equal(result.status, "failed");
    assert.equal(result.errors.length, 1);
    assert.deepEqual(result.tasks[0]!.decision, rejected.tasks[0]!.decision);
  }
  await assert.rejects(
    graph.start({ checkpoint, decisions: [decision(first)] }),
    /Invalid or unauthorized/,
  );
});

test("pause nodes require a resume decision and never approve from elapsed time", async (t) => {
  const { checkpoint } = await setup(t);
  const pause = definePauseTask(gateOptions);
  const graph = defineWorkflow("release", [pause]);
  const first = await graph.start({ checkpoint });
  await assert.rejects(
    graph.start({ checkpoint, decisions: [decision(first)] }),
    /Invalid or unauthorized/,
  );
  const again = await graph.start({ checkpoint });
  assert.equal(again.status, "paused");
  const result = await graph.start({
    checkpoint,
    decisions: [decision(first, "resume")],
  });
  result.unwrap();
  assert.equal(result.value(pause).action, "resume");
  assert.equal(result.usage.attempts, 0);
});

test("all invalid decisions fail atomically and leave the pending request unchanged", async (t) => {
  const { checkpoint } = await setup(t);
  const graph = defineWorkflow("release", [defineApprovalTask(gateOptions)]);
  const first = await graph.start({ checkpoint });
  const good = decision(first);
  const invalid = [
    { ...good, executionId: "another-run" },
    { ...good, key: "another-task" },
    { ...good, requestId: "another-request" },
    { ...good, actor: "someone-else" },
    { ...good, actor: "" },
    { ...good, reason: " " },
    { ...good, action: "resume" as const },
  ];
  for (const decisions of [
    [],
    [good, good],
    ...invalid.map((item) => [item]),
    [good, invalid[0]!],
  ]) {
    await assert.rejects(
      graph.start({ checkpoint, decisions }),
      /decisions cannot be empty|Invalid or unauthorized/,
    );
    const unchanged = await graph.start({ checkpoint });
    assert.equal(unchanged.status, "paused");
    assert.equal(unchanged.tasks[0]!.decision, undefined);
    assert.deepEqual(unchanged.tasks[0]!.pause, first.tasks[0]!.pause);
  }
});

test("gates reject absent persistence, invalid owners and unsolicited decisions", async (t) => {
  const { checkpoint } = await setup(t);
  for (const actors of [[], [" "], ["maintainer", "maintainer"]])
    assert.throws(
      () => defineApprovalTask({ ...gateOptions, actors }),
      /actors/,
    );
  assert.throws(
    () => definePauseTask({ ...gateOptions, prompt: " " }),
    /prompt/,
  );
  const review = defineApprovalTask(gateOptions);
  await assert.rejects(
    defineWorkflow("release", [review]).start(),
    /require a checkpoint/,
  );
  assert.throws(
    () => defineWorkflow("release", [{ ...review, retry: { attempts: 2 } }]),
    /cannot have/,
  );
  const unsolicited: WorkflowDecision = {
    executionId: "new",
    key: "review",
    requestId: "new",
    action: "approve",
    actor: "maintainer",
    reason: "ready",
  };
  await assert.rejects(
    defineWorkflow("release", [review]).start({
      checkpoint,
      decisions: [unsolicited],
    }),
    /Invalid or unauthorized/,
  );
  await assert.rejects(
    defineWorkflow("release", []).start({ decisions: [unsolicited] }),
    /require a checkpoint/,
  );
  const first = await defineWorkflow("release", [review]).start({ checkpoint });
  assert.equal(first.status, "paused");
});

test("ownership, prompt, kind and dependency changes invalidate persisted requests", async (t) => {
  const { checkpoint } = await setup(t);
  await defineWorkflow("release", [defineApprovalTask(gateOptions)]).start({
    checkpoint,
  });
  for (const gate of [
    defineApprovalTask({ ...gateOptions, actors: ["other"] }),
    defineApprovalTask({ ...gateOptions, prompt: "Different change?" }),
    definePauseTask(gateOptions),
  ])
    await assert.rejects(
      defineWorkflow("release", [gate]).start({ checkpoint }),
      /incompatible/,
    );
});

test("approval preserves cumulative attempt budgets across pause and resume", async (t) => {
  const { checkpoint } = await setup(t);
  const build = defineTask({ key: "build", perform: () => 42 });
  const review = defineApprovalTask({ ...gateOptions, after: [build] });
  const child = defineTask({
    key: "child",
    after: [review],
    perform: () => assert.fail("budget exceeded"),
  });
  const graph = defineWorkflow("release", [build, review, child]);
  const first = await graph.start({ checkpoint, budget: { attempts: 1 } });
  assert.equal(first.status, "paused");
  const result = await graph.start({
    checkpoint,
    budget: { attempts: 1 },
    decisions: [decision(first)],
  });
  assert.equal(result.status, "failed");
  assert.equal(result.usage.attempts, 1);
  assert.equal(result.tasks[1]!.status, "done");
  assert.equal(result.tasks[2]!.status, "cancelled");
});

test("independent pending requests can be decided separately and cannot unblock each other", async (t) => {
  const { checkpoint } = await setup(t);
  const firstGate = defineApprovalTask(gateOptions);
  const secondGate = defineApprovalTask({ ...gateOptions, key: "second" });
  let calls = 0;
  const child = defineTask({
    key: "child",
    after: [firstGate, secondGate],
    perform: () => ++calls,
  });
  const graph = defineWorkflow("release", [firstGate, secondGate, child]);
  const first = await graph.start({ checkpoint, concurrency: 3 });
  const partial = await graph.start({
    checkpoint,
    decisions: [decision(first)],
  });
  assert.equal(partial.status, "paused");
  assert.equal(calls, 0);
  const done = await graph.start({
    checkpoint,
    decisions: [decision(first, "approve", "second")],
  });
  done.unwrap();
  assert.equal(calls, 1);
});

test(
  "a process exits naturally while paused and a new process resumes the exact request",
  { timeout: 10000 },
  async (t) => {
    const { directory, checkpoint } = await setup(t);
    const script = join(directory, "pause.mjs");
    const module = new URL("../../src/index.ts", import.meta.url).href;
    await writeFile(
      script,
      `import { defineApprovalTask, defineTask, defineWorkflow, createWorkflowCheckpointStore, createLocalTransport } from ${JSON.stringify(module)};
const source = defineTask({key:'source',perform:()=>42});
const gate = defineApprovalTask({key:'review',after:[source],prompt:'Ship this change?',actors:['maintainer']});
const result = await defineWorkflow('release',[source,gate]).start({checkpoint:{store:createWorkflowCheckpointStore({ transporter: createLocalTransport({ directory: ${JSON.stringify(directory)} }) }),runId:'release',version:'1'}});
console.log(JSON.stringify(result));`,
    );
    const child = spawn(process.execPath, [script], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    t.after(() => child.kill("SIGKILL"));
    let output = "";
    child.stdout.on("data", (data: Buffer) => {
      output += data.toString();
    });
    const [code] = await once(child, "exit");
    assert.equal(code, 0);
    const first: WorkflowResult = JSON.parse(output);
    assert.equal(first.status, "paused");
    const source = defineTask({
      key: "source",
      perform: () => assert.fail("source replayed"),
    });
    const review = defineApprovalTask({ ...gateOptions, after: [source] });
    const done = await defineWorkflow("release", [source, review]).start({
      checkpoint,
      decisions: [decision(first)],
    });
    done.unwrap();
    assert.equal(done.value(source), 42);
    assert.equal(done.executionId, first.executionId);
  },
);

test("corrupt requests and decisions are rejected before executing anything", async (t) => {
  const { directory, checkpoint } = await setup(t);
  const review = defineApprovalTask(gateOptions);
  const graph = defineWorkflow("release", [review]);
  const first = await graph.start({ checkpoint });
  const transporter = createLocalTransport({ directory });
  const key = `checkpoints/${createHash("sha256").update(checkpoint.runId).digest("hex")}.json`;
  const read = async () =>
    JSON.parse(Buffer.from((await transporter.read(key))!.bytes).toString())
      .checkpoint;
  const write = async (_path: string, checkpoint: string) =>
    transporter.write(
      key,
      Buffer.from(
        JSON.stringify({ owner: null, checkpoint: JSON.parse(checkpoint) }),
      ),
      { ifRevision: (await transporter.read(key))!.revision },
    );
  const path = key;
  const initial = await read();
  for (const patch of [
    { pause: undefined },
    { status: "active", pause: undefined },
    { pause: { ...initial.records[0].pause, actors: ["intruder"] } },
    { pause: { ...initial.records[0].pause, id: "" } },
    { pause: { ...initial.records[0].pause, requestedAt: "invalid" } },
    { decision: decision(first) },
  ]) {
    await write(
      path,
      JSON.stringify({
        ...initial,
        records: [{ ...initial.records[0], ...patch }],
      }),
    );
    await assert.rejects(graph.start({ checkpoint }), /Invalid/);
  }
  await write(path, JSON.stringify(initial));
  await graph.start({ checkpoint, decisions: [decision(first)] });
  const approved = await read();
  for (const patch of [
    { decision: undefined },
    { decision: { ...approved.records[0].decision, actor: "intruder" } },
    { decision: { ...approved.records[0].decision, reason: "" } },
    { decision: { ...approved.records[0].decision, decidedAt: "invalid" } },
  ]) {
    await write(
      path,
      JSON.stringify({
        ...approved,
        records: [{ ...approved.records[0], ...patch }],
      }),
    );
    await assert.rejects(graph.start({ checkpoint }), /Invalid/);
  }
  await write(
    path,
    JSON.stringify({
      ...approved,
      values: { review: { kind: "json", value: {} } },
    }),
  );
  await assert.rejects(graph.start({ checkpoint }), /Invalid/);
});

test("decision checkpoint failures prevent dependent side effects", async () => {
  let saved: unknown;
  const store: WorkflowCheckpointStore = {
    async acquire() {
      return {
        async read() {
          return saved;
        },
        async write(value) {
          if (value.records.some((record) => record.decision))
            throw new Error("disk full");
          saved = structuredClone(value);
        },
        async release() {},
      };
    },
  };
  const checkpoint = { store, runId: "failure", version: "1" };
  const review = defineApprovalTask(gateOptions);
  const child = defineTask({
    key: "child",
    after: [review],
    perform: () => assert.fail("uncommitted approval executed"),
  });
  const graph = defineWorkflow("release", [review, child]);
  const first = await graph.start({ checkpoint });
  await assert.rejects(
    graph.start({ checkpoint, decisions: [decision(first)] }),
    /disk full/,
  );
  const pending = await graph.start({ checkpoint });
  assert.equal(pending.status, "paused");
});

test("clean pause restarts retain condition skips without evaluating them again", async (t) => {
  const { checkpoint } = await setup(t);
  let checks = 0;
  const skipped = defineTask({
    key: "skip",
    condition() {
      return ++checks > 1;
    },
    perform() {
      assert.fail("completed conditional skip replayed");
    },
  });
  const review = defineApprovalTask(gateOptions);
  const graph = defineWorkflow("release", [skipped, review]);
  const first = await graph.start({ checkpoint });
  const pending = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  assert.equal(pending.status, "paused");
  const result = await graph.start({
    checkpoint,
    decisions: [decision(first)],
  });
  result.unwrap();
  assert.equal(checks, 1);
  assert.equal(result.tasks[0]!.status, "skipped");
});

test("observer mutation cannot change a validated approval decision", async (t) => {
  const { checkpoint } = await setup(t);
  const review = defineApprovalTask(gateOptions);
  const graph = defineWorkflow("release", [review]);
  const first = await graph.start({ checkpoint });
  const input = { ...decision(first) };
  const result = await graph.start({
    checkpoint,
    decisions: [input],
    observe(event) {
      if (event.type === "start") input.actor = "intruder";
      throw new Error("observer failure");
    },
  });
  result.unwrap();
  assert.equal(result.value(review).actor, "maintainer");
  assert.ok(result.observerErrors.length > 0);
  (await graph.start({ checkpoint })).unwrap();
});
