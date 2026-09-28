import assert from "node:assert/strict";
import { test } from "node:test";
import { join } from "node:path";
import {
  agent,
  kimiHarness,
  createSandbox,
  isolatedTask,
  task,
  workflow,
  speculate,
  workflowCheckpointStore,
  localTransport,
  WorkflowUsageUnavailable,
  type AgentObservation,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { repository, scripted, emit } from "../helpers.ts";

function kimiFixture(home: string, status = 0, hang = false) {
  return {
    ...agent({ harness: kimiHarness({ variables: { KIMI_CODE_HOME: home } }) }),
    capture: false,
    resumable: false,
    request: () => ({
      executable: process.execPath,
      arguments: [
        "--input-type=module",
        "-e",
        `
        import { mkdirSync, writeFileSync } from "node:fs";
        import { join } from "node:path";
        const directory = join(process.env.KIMI_CODE_HOME, "sessions", "workspace", "session_fixture", "agents", "main");
        mkdirSync(directory, { recursive: true });
        writeFileSync(join(directory, "wire.jsonl"), JSON.stringify({ type: "usage.record", usage: {
          inputOther: 7, output: 2, inputCacheRead: 3, inputCacheCreation: 1
        } }) + "\\n");
        console.log(JSON.stringify({ role: "meta", type: "session.resume_hint", session_id: "session_fixture" }));
        console.log(JSON.stringify({ role: "assistant", content: "done" }));
        process.exitCode = ${status};
        ${hang ? "setInterval(() => {}, 1000);" : ""}
      `,
      ],
    }),
  };
}

test("session accounting counts failed retries and successful passes once", async (t) => {
  const repo = await repository(t);
  const selected = kimiFixture(join(repo, ".outpost", "kimi-usage"), 7);
  const run = isolatedTask({
    key: "kimi",
    retry: { attempts: 2 },
    timeoutMs: 10_000,
    request: () => ({
      repository: repo,
      sandboxProvider: localSandboxProvider(),
      agent: selected,
      brief: { text: "fixture" },
      logging: false,
    }),
  });
  const result = await workflow("kimi-failure", [run]).start({
    budget: { attempts: 2, usage: { input: 100 } },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.usage.attempts, 2);
  assert.deepEqual(result.usage.tokens, {
    input: 14,
    cached: 6,
    output: 4,
    cacheCreated: 2,
  });
  await using sandbox = await createSandbox({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    agent: kimiFixture(join(repo, ".outpost", "kimi-usage")),
    logging: false,
  });
  const output = await sandbox.dispatch({
    brief: { text: "fixture" },
    passes: 2,
  });
  assert.deepEqual(output.usage, result.usage.tokens);
});

test("cancelled collection retains measured tokens, marks incompleteness and permits warm reuse", async (t) => {
  const repo = await repository(t);
  const controller = new AbortController();
  const events: AgentObservation[] = [];
  await using sandbox = await createSandbox({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    agent: kimiFixture(join(repo, ".outpost", "kimi-usage"), 0, true),
    logging: false,
  });
  await assert.rejects(
    sandbox.dispatch({
      brief: { text: "fixture" },
      signal: controller.signal,
      observe(event) {
        events.push(event);
        if (event.kind === "conversation")
          controller.abort(new Error("cancel fixture"));
      },
    }),
    /cancel fixture/,
  );
  const usage = events.filter((event) => event.kind === "usage");
  assert.equal(
    usage.reduce((sum, event) => sum + event.tokens.input, 0),
    7,
  );
  assert.ok(usage.some((event) => event.tokens.complete === false));
  const reused = await sandbox.command({
    executable: process.execPath,
    arguments: ["-e", "process.stdout.end('reused'); process.exitCode = 9"],
  });
  assert.equal(reused.status, 9);
  assert.equal(reused.stdout, "reused");
});

test("known unavailable usage refuses a token-only workflow before invoking the agent", async (t) => {
  const repo = await repository(t);
  let invoked = false;
  const selected = {
    ...scripted(emit("done")),
    usage: "unavailable" as const,
    request() {
      invoked = true;
      throw new Error("must not invoke");
    },
  };
  const run = isolatedTask({
    key: "unknown",
    request: () => ({
      repository: repo,
      agent: selected,
      sandboxProvider: localSandboxProvider(),
      brief: { text: "fixture" },
      logging: false,
    }),
  });
  const result = await workflow("unknown", [run]).start({
    budget: { usage: { input: 100 } },
  });
  assert.equal(invoked, false);
  assert.equal(result.usage.tokens.complete, false);
  assert.ok(
    result.errors.some((error) => error instanceof WorkflowUsageUnavailable),
  );
});

test("missing usage stops retries and dependents unless an attempt budget is configured", async (t) => {
  const repo = await repository(t);
  const selected = { ...scripted(emit("done")), usage: "events" as const };
  const run = isolatedTask({
    key: "missing",
    retry: { attempts: 3 },
    timeoutMs: 10_000,
    request: () => ({
      repository: repo,
      agent: selected,
      sandboxProvider: localSandboxProvider(),
      brief: { text: "fixture" },
      logging: false,
    }),
  });
  let followed = 0;
  const child = task({
    key: "child",
    after: [run],
    perform() {
      followed++;
    },
  });
  const graph = workflow("missing", [run, child]);
  const rejected = await graph.start({ budget: { usage: { input: 100 } } });
  assert.equal(rejected.status, "failed");
  assert.equal(rejected.usage.attempts, 1);
  assert.equal(followed, 0);
  const bounded = await graph.start({
    budget: { attempts: 2, usage: { input: 100 } },
  });
  bounded.unwrap();
  assert.equal(followed, 1);
  assert.equal(bounded.usage.tokens.complete, false);
  assert.equal(bounded.value(run).usage.complete, false);
});

test("speculation rejects unknown token-only accounting and accepts a bounded candidate", async (t) => {
  const repo = await repository(t);
  const options = {
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    candidates: [
      {
        key: "unknown",
        agent: { ...scripted(emit("done")), usage: "events" as const },
        request: { brief: { text: "fixture" }, deadlineMs: 5000 },
      },
    ],
    validate: () => true,
  };
  const rejected = await speculate({
    ...options,
    budget: { usage: { input: 100 } },
  });
  assert.equal(rejected.status, "budget-exhausted");
  assert.ok(rejected.error instanceof WorkflowUsageUnavailable);
  assert.equal(rejected.usage.tokens.complete, false);
  const bounded = await speculate({
    ...options,
    budget: { attempts: 1, usage: { input: 100 } },
  });
  assert.equal(bounded.status, "winner");
  assert.equal(bounded.usage.tokens.complete, false);
});

test("checkpoint replay preserves incomplete usage and blocks newly token-only admission", async (t) => {
  const repo = await repository(t);
  const checkpoint = {
    store: workflowCheckpointStore({
      transporter: localTransport({
        directory: join(repo, ".outpost", "checkpoints"),
      }),
    }),
    runId: "usage",
    version: "1",
  };
  const source = task({
    key: "source",
    perform(context) {
      context.reportUsage({ input: 2, cached: 0, output: 1, complete: false });
      return 4;
    },
  });
  let calls = 0;
  const target = task({
    key: "target",
    after: [source],
    perform() {
      calls++;
      throw new Error("retry later");
    },
  });
  const graph = workflow("persisted-usage", [source, target]);
  const first = await graph.start({ checkpoint, budget: { attempts: 2 } });
  assert.equal(first.usage.tokens.complete, false);
  const resumed = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
    budget: { usage: { input: 100 } },
  });
  assert.equal(calls, 1);
  assert.deepEqual(resumed.usage, first.usage);
  assert.ok(
    resumed.errors.some((error) => error instanceof WorkflowUsageUnavailable),
  );
  assert.equal(resumed.value(source), 4);
});
