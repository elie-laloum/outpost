import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentTask,
  createSandbox,
  isolatedTask,
  response,
  task,
  workflow,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

const usage = (input: number) =>
  `console.log(JSON.stringify({ kind: "usage", tokens: { input: ${input}, cached: 1, output: 2 } }));`;

test("warm agent tasks account each pass once and preserve observer isolation", async (t) => {
  const repo = await repository(t);
  await using sandbox = await createSandbox({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(`${usage(3)} ${emit("not finished")}`),
  });
  const events: string[] = [];
  const run = agentTask({
    key: "agent",
    sandbox,
    request: () => ({
      brief: { text: "fixture" },
      passes: 2,
      observe(event) {
        events.push(event.kind);
        throw new Error("observer");
      },
    }),
  });
  const result = await workflow("passes", [run]).start({
    budget: { usage: { input: 7 } },
  });
  result.unwrap();
  assert.equal(result.value(run).turns.length, 2);
  assert.equal(events.filter((kind) => kind === "summary").length, 2);
  assert.deepEqual(result.usage.tokens, { input: 6, cached: 2, output: 4 });
});

test("isolated task streaming usage cancels the running process, blocks retries and dependents", async (t) => {
  const repo = await repository(t);
  const run = isolatedTask({
    key: "isolated",
    retry: { attempts: 3 },
    request: () => ({
      repository: repo,
      sandboxProvider: localSandboxProvider(),
      agent: scripted(`${usage(5)} setTimeout(() => {}, 60_000);`),
      brief: { text: "fixture" },
    }),
  });
  const child = task({
    key: "child",
    after: [run],
    perform: () => assert.fail("budget must block child"),
  });
  const result = await workflow("stream", [run, child]).start({
    budget: { usage: { input: 5 } },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.usage.attempts, 1);
  assert.equal(result.usage.tokens.input, 5);
  assert.ok(result.tasks.every((entry) => entry.status === "cancelled"));
});

test("failed agent attempts remain accounted across workflow retries", async (t) => {
  const repo = await repository(t);
  const run = isolatedTask({
    key: "retry",
    retry: { attempts: 2 },
    request: () => ({
      repository: repo,
      sandboxProvider: localSandboxProvider(),
      agent: scripted(`${usage(3)} process.exitCode = 7;`),
      brief: { text: "fixture" },
    }),
  });
  const result = await workflow("failed-usage", [run]).start({
    budget: { usage: { input: 20 } },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.usage.attempts, 2);
  assert.equal(result.usage.tokens.input, 6);
});

test("structured repair turns share a task admission and count each turn once", async (t) => {
  const repo = await repository(t);
  const agent = scripted(
    (input) =>
      `${usage(3)} console.log(JSON.stringify({ kind: "conversation", id: "fixture" })); ${emit(input.continuation ? "<answer>valid</answer>" : "invalid")}`,
  );
  await using sandbox = await createSandbox({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    agent,
  });
  const run = agentTask({
    key: "repair",
    sandbox,
    request: () => ({
      brief: { text: "Return <answer>text</answer>" },
      response: response.text({ tag: "answer", repairs: 1 }),
    }),
  });
  const result = await workflow("repairs", [run]).start({
    budget: { attempts: 1, usage: { input: 7 } },
  });
  result.unwrap();
  assert.equal(result.value(run).value, "valid");
  assert.equal(result.value(run).turns.length, 2);
  assert.equal(result.usage.attempts, 1);
  assert.equal(result.usage.tokens.input, 6);
});

test("budget cancellation keeps a warm sandbox reusable", async (t) => {
  const repo = await repository(t);
  await using sandbox = await createSandbox({
    repository: repo,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(`${usage(5)} setTimeout(() => {}, 60_000);`),
  });
  const run = agentTask({
    key: "cancel",
    sandbox,
    request: () => ({ brief: { text: "fixture" }, passes: 2 }),
  });
  const result = await workflow("warm-budget", [run]).start({
    budget: { usage: { input: 5 } },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.usage.tokens.input, 5);
  const command = await sandbox.command({
    executable: process.execPath,
    arguments: ["-e", "console.log('reused'); process.exitCode = 7;"],
  });
  assert.equal(command.status, 7);
  assert.equal(command.stdout.trim(), "reused");
});
