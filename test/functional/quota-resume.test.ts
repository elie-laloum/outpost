import assert from "node:assert/strict";
import { test } from "node:test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  agentTask,
  createSandbox,
  interactiveAgentTask,
  isolatedTask,
  OutpostError,
  task,
  workflow,
} from "../../src/index.ts";
import type {
  AgentInput,
  CliAgent,
  ConversationStore,
  TaskContext,
  WorkflowCheckpoint,
  WorkflowCheckpointStore,
  WorkflowQuotaPause,
} from "../../src/index.ts";
import { recordRecovery } from "../../src/domain/errors.ts";
import { quotaWorkspace } from "../../src/application/quota-resume.ts";
import type { IsolatedTaskRequest } from "../../src/application/tasks.types.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

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
  };
}

const limit = (details: Record<string, unknown> = {}) =>
  new OutpostError("quota", "usage limit reached", details);

test("the first attempt after a quota pause receives the captured conversation and branch", async () => {
  const memory = memoryCheckpoint();
  const seen: (WorkflowQuotaPause | undefined)[] = [];
  const build = task({
    key: "build",
    retry: { attempts: 2 },
    perform: (context: TaskContext) => {
      seen.push(context.quota);
      if (seen.length === 1) {
        const error = limit({ conversation: "session-1" });
        recordRecovery(error, { branch: "outpost/job-1", transcript: "/t" });
        throw error;
      }
      if (seen.length === 2) throw new Error("flaky");
      return "built";
    },
  });
  const graph = workflow("nightly", [build]);
  const paused = await graph.start({
    checkpoint: memory.checkpoint,
    onQuota: { action: "pause" },
  });
  assert.equal(paused.status, "paused");
  assert.equal(memory.saved.records[0]!.quota?.conversation, "session-1");
  assert.equal(memory.saved.records[0]!.quota?.branch, "outpost/job-1");
  const done = await graph.start({
    checkpoint: memory.checkpoint,
    onQuota: { action: "pause" },
  });
  done.unwrap();
  assert.equal(seen[0], undefined);
  assert.equal(seen[1]?.conversation, "session-1");
  assert.equal(seen[1]?.branch, "outpost/job-1");
  assert.equal(seen[2], undefined);
});

test("an uncaptured conversation is not offered for continuation", async () => {
  const memory = memoryCheckpoint();
  let resumed: WorkflowQuotaPause | undefined;
  let calls = 0;
  const build = task({
    key: "build",
    perform: (context: TaskContext) => {
      if (++calls === 1) throw limit({ conversation: "session-1" });
      resumed = context.quota;
      return calls;
    },
  });
  const graph = workflow("nightly", [build]);
  await graph.start({
    checkpoint: memory.checkpoint,
    onQuota: { action: "pause" },
  });
  (await graph.start({ checkpoint: memory.checkpoint })).unwrap();
  assert.ok(resumed);
  assert.equal(resumed.conversation, undefined);
});

async function storedAgent(
  t: { after(fn: () => unknown): void },
  root: string,
  script: (input: AgentInput) => string,
): Promise<CliAgent> {
  const file = join(root, "..", `${Math.random().toString(36).slice(2)}.jsonl`);
  t.after(() => writeFile(file, "").catch(() => {}));
  const storage: ConversationStore = {
    name: "fixture-store",
    async locate(id) {
      return { id, file, format: "custom" };
    },
    async capture(id) {
      await writeFile(file, "native data");
      return { id, file, format: "custom" };
    },
    async restore() {},
  };
  return { ...scripted(script), storage };
}

const interrupted = (conversation: string) => {
  const lines = [
    { kind: "conversation", id: conversation },
    {
      kind: "quota",
      message: "limit",
      resetAt: new Date(Date.now() + 2_000).toISOString(),
    },
    { kind: "failure", message: "Usage limit" },
  ];
  return `${lines.map((line) => `console.log(${JSON.stringify(JSON.stringify(line))});`).join("")}process.exit(1);`;
};

for (const quotaResume of ["continue", "restart"] as const)
  test(`agentTask ${quotaResume}s after a quota pause`, async (t) => {
    const root = await repository(t);
    const inputs: AgentInput[] = [];
    const fixture = await storedAgent(t, root, (input) => {
      inputs.push(input);
      return inputs.length === 1 ? interrupted("session-1") : emit("done");
    });
    await using sandbox = await createSandbox({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent: fixture,
      logging: false,
    });
    const coder = agentTask({
      key: "coder",
      sandbox,
      quotaResume,
      request: () => ({ brief: { text: "implement the feature" } }),
    });
    const run = task({
      key: "run",
      perform: async (context) => (await coder.perform(context)).text,
    });
    const result = await workflow("nightly", [run]).start({
      checkpoint: memoryCheckpoint().checkpoint,
      onQuota: { action: "pause", maxWaitMs: 5_000 },
    });
    result.unwrap();
    assert.equal(inputs.length, 2);
    if (quotaResume === "continue") {
      assert.deepEqual(inputs[1]!.continuation, { id: "session-1" });
      assert.match(inputs[1]!.text!, /interrupted by a usage or rate limit/);
    } else {
      assert.equal(inputs[1]!.continuation, undefined);
      assert.equal(inputs[1]!.text, "implement the feature");
    }
  });

test("isolatedTask continues the captured conversation in a new dispatch", async (t) => {
  const root = await repository(t);
  const inputs: AgentInput[] = [];
  const fixture = await storedAgent(t, root, (input) => {
    inputs.push(input);
    return inputs.length === 1 ? interrupted("session-2") : emit("done");
  });
  const coder = isolatedTask({
    key: "coder",
    request: () => ({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent: fixture,
      logging: false,
      brief: { text: "implement" },
    }),
  });
  const run = task({
    key: "run",
    perform: async (context) => (await coder.perform(context)).text,
  });
  const result = await workflow("nightly", [run]).start({
    checkpoint: memoryCheckpoint().checkpoint,
    onQuota: { action: "pause", maxWaitMs: 5_000 },
  });
  result.unwrap();
  assert.deepEqual(inputs[1]!.continuation, { id: "session-2" });
});

test("quota workspaces restart integrated work from the interrupted branch only", () => {
  const context = {
    quota: {
      requestedAt: new Date().toISOString(),
      message: "limit",
      conversation: "c",
      branch: "outpost/job-1",
    },
  } as TaskContext;
  const base = { brief: { text: "x" }, continuation: { id: "c" } };
  assert.deepEqual(
    quotaWorkspace(context, { ...base, branch: { mode: "integrate" } }).branch,
    { mode: "integrate", from: "outpost/job-1" },
  );
  const remote: IsolatedTaskRequest<undefined> = {
    ...base,
    agent: scripted(""),
    sandboxProvider: { ...localSandboxProvider(), placement: "remote" },
  };
  assert.deepEqual(quotaWorkspace(context, remote).branch, {
    mode: "integrate",
    from: "outpost/job-1",
  });
  for (const options of [
    { ...base, branch: { mode: "named" as const, name: "feature" } },
    { ...base, branch: { mode: "current" as const } },
    { brief: { text: "x" }, branch: { mode: "integrate" as const } },
  ])
    assert.deepEqual(quotaWorkspace(context, options), options);
});

test("an interactive turn interrupted by quota continues its own conversation", async (t) => {
  const root = await repository(t);
  const inputs: AgentInput[] = [];
  const fixture = await storedAgent(t, root, (input) => {
    inputs.push(input);
    if (inputs.length === 1) return interrupted("turn-1");
    const text = `<interaction>${JSON.stringify({ kind: "completed", output: { ok: true } })}</interaction>`;
    return `console.log(${JSON.stringify(JSON.stringify({ kind: "conversation", id: "turn-1" }))});${emit(text)}`;
  });
  const interview = interactiveAgentTask({
    key: "interview",
    repository: root,
    actors: ["owner"],
    brief: "Design a shop",
    bootstrap: false,
    sandboxProvider: localSandboxProvider(),
    agent: fixture,
  });
  const result = await workflow("interview", [interview]).start({
    checkpoint: memoryCheckpoint().checkpoint,
    onQuota: { action: "pause", maxWaitMs: 5_000 },
  });
  result.unwrap();
  assert.equal(JSON.stringify(result.value(interview).output), '{"ok":true}');
  assert.deepEqual(inputs[1]!.continuation, { id: "turn-1" });
  assert.match(inputs[1]!.text!, /interrupted by a usage or rate limit/);
});
