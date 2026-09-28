import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentTask,
  createSandbox,
  loopTask,
  workflow,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

const usage = `console.log(JSON.stringify({ kind: "usage", tokens: { input: 3, cached: 1, output: 2 } }));`;

test("scripted coder and reviewer both account streaming usage once per round", async (t) => {
  await using coder = await createSandbox({
    repository: await repository(t),
    sandboxProvider: localSandboxProvider(),
    agent: scripted(
      (input) =>
        usage +
        emit(input.text?.includes("missing case") ? "fixed" : "candidate"),
    ),
  });
  await using reviewer = await createSandbox({
    repository: await repository(t),
    sandboxProvider: localSandboxProvider(),
    agent: scripted(
      (input) =>
        usage + emit(input.text === "fixed" ? "accepted" : "missing case"),
    ),
  });
  const fix = loopTask({
    key: "fix",
    maxRounds: 3,
    async attempt(ctx, feedback) {
      const result = await agentTask({
        key: "coder",
        sandbox: coder,
        request: () => ({ brief: { text: feedback ?? "code" } }),
      }).perform(ctx);
      return result.text;
    },
    async check(ctx, text) {
      const result = await agentTask({
        key: "reviewer",
        sandbox: reviewer,
        request: () => ({ brief: { text } }),
      }).perform(ctx);
      return result.text === "accepted"
        ? { done: true }
        : { done: false, feedback: result.text };
    },
  });
  const result = await workflow("reviewed", [fix]).start({
    budget: { attempts: 3, usage: { input: 20 } },
  });
  result.unwrap();
  assert.equal(result.value(fix), "fixed");
  assert.equal(result.usage.attempts, 2);
  assert.deepEqual(result.usage.tokens, { input: 12, cached: 4, output: 8 });
  assert.equal(
    (
      await coder.command({
        executable: process.execPath,
        arguments: ["-e", "process.exit(0)"],
      })
    ).status,
    0,
  );
});
