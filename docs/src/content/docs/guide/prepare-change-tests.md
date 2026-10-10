---
title: "Prepare tests for a change"
description: "Prepare a reviewed plan’s tests and keep them on a branch before implementation."
---

Prepare a reviewed plan’s tests and keep them on a branch before implementation. Start with `ticket.ts`, `frame.ts`, `plan.ts`, `approval.ts` and `checkpoint.ts` from [planning a change](../plan-a-change/), the [setup configuration](../setup/) and `zod`. Your repository needs a working `npm test` command and a package lockfile for `npm ci`.

<!-- example:include plan-a-change ticket.ts frame.ts plan.ts approval.ts checkpoint.ts -->

[Download all files](../../guide-examples/prepare-change-tests.tar.gz). Extract into a dedicated directory, run `npm install`, then adapt `outpost.config.ts` using [Installation](../setup/). The commands below identify the scripts to run.

This lesson reuses the previous lesson’s files, not its saved execution. It defines another graph and needs its own `runId`: planning runs again. For one path from ticket to implementation, start directly with the [development workflow](../development-workflow/) project.

## Prepare and reuse the sandbox

These helpers open one sandbox when delivery starts and reuse it for commands and agent turns.

<!-- tabs -->

```ts title="branch.ts"
import { ticket } from "./ticket.ts";

export const branch = `outpost/${ticket.key.toLowerCase()}`;
export const isTest = (file: string) =>
  /(^|\/)test\/|\.test\.[cm]?[jt]s$/.test(file);
```

```ts title="workbench.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";
import { branch } from "./branch.ts";

export let opened: Sandbox | undefined;
export async function workbench() {
  opened ??= await createSandbox({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: branch },
    hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
  });
  return opened;
}
export async function closeWorkbench() {
  await opened?.close();
  opened = undefined;
}
```

```ts title="commands.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { workbench } from "./workbench.ts";

export async function run(
  context: LoopTaskContext,
  executable: string,
  ...args: string[]
) {
  return (await workbench()).command({
    executable,
    arguments: args,
    retain: 20_000,
    signal: context.signal,
  });
}
```

```ts title="git.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { run } from "./commands.ts";

export async function changedFiles(context: LoopTaskContext) {
  const status = await run(
    context,
    "git",
    "status",
    "--porcelain=v1",
    "-z",
    "--no-renames",
    "-uall",
  );
  if (status.status !== 0) throw new Error(status.stderr);
  if (
    Buffer.byteLength(status.stdout) >= 20_000 ||
    (status.stdout && !status.stdout.endsWith("\0"))
  ) {
    throw new Error("Incomplete Git status output");
  }
  return status.stdout
    .split("\0")
    .filter(Boolean)
    .map((entry) => entry.slice(3));
}
export async function commit(context: LoopTaskContext, message: string) {
  await run(context, "git", "add", "--all");
  const result = await run(context, "git", "commit", "--message", message);
  if (result.status !== 0) throw new Error(result.stderr);
}
```

```ts title="ask.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";
import { workbench } from "./workbench.ts";

export async function ask(
  context: LoopTaskContext,
  key: string,
  lines: string[],
) {
  const role = defineAgentTask({
    key,
    sandbox: await workbench(),
    request: () => ({ brief: { text: lines.join("\n") } }),
  });
  return (await role.perform(context)).text;
}
```

These shared types connect each loop’s attempts and checks.

```ts title="loop.types.ts"
import type { LoopTaskContext, LoopCheckResult } from "@elie-laloum/outpost";

export type LoopCheck = (context: LoopTaskContext) => Promise<LoopCheckResult>;
export type LoopAttempt = (
  context: LoopTaskContext,
  feedback: string | undefined,
) => Promise<{ summary: string }>;
```

## Write and check the tests

The test loop rejects changes outside test files and requires the tests to fail before committing.

<!-- tabs -->

```ts title="write-zones.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { changedFiles } from "./git.ts";
import { isTest } from "./branch.ts";

export async function checkTestFiles(context: LoopTaskContext) {
  const files = await changedFiles(context);
  const outside = files.filter((file) => !isTest(file));
  if (!files.length) return "No test changed.";
  if (outside.length) return `Revert:\n${outside.join("\n")}`;
}
export async function checkCodeFiles(context: LoopTaskContext) {
  const edited = (await changedFiles(context)).filter(isTest);
  if (edited.length) return `Revert:\n${edited.join("\n")}`;
}
```

```ts title="test-attempt.ts"
import type { LoopAttempt } from "./loop.types.ts";
import { ask } from "./ask.ts";
import { ticket } from "./ticket.ts";
import { plan } from "./plan.ts";

export const testAttempt: LoopAttempt = async (context, feedback) => {
  const summary = await ask(context, "test-writer", [
    `Ticket ${ticket.key}: ${ticket.text}`,
    "Write tests for these behaviors. Edit test files only and do not commit.",
    ...context.value(plan).tests.map((item) => `- ${item}`),
    feedback ? `Your last attempt was rejected:\n${feedback}` : "",
  ]);
  return { summary };
};
```

```ts title="test-check.ts"
import type { LoopCheck } from "./loop.types.ts";
import { checkTestFiles } from "./write-zones.ts";
import { run } from "./commands.ts";
import { commit } from "./git.ts";
import { ticket } from "./ticket.ts";

export const testCheck: LoopCheck = async (context) => {
  const rejection = await checkTestFiles(context);
  if (rejection) return { done: false, feedback: rejection };
  const result = await run(context, "npm", "test");
  if (result.status === 0)
    return { done: false, feedback: "The tests already pass." };
  await commit(context, `test(${ticket.key}): ${ticket.text}`);
  return { done: true };
};
```

```ts title="tests.ts"
import { defineLoopTask } from "@elie-laloum/outpost";
import { review } from "./approval.ts";
import { testAttempt } from "./test-attempt.ts";
import { testCheck } from "./test-check.ts";

export const tests = defineLoopTask({
  key: "tests",
  after: [review],
  maxRounds: 4,
  attempt: testAttempt,
  check: testCheck,
});
```

## Start the test workflow

Save these files beside the helpers. Use a fresh ticket key: this four-task graph has its own checkpoint identity.

<!-- tabs -->

```ts title="workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { frame } from "./frame.ts";
import { plan } from "./plan.ts";
import { review } from "./approval.ts";
import { tests } from "./tests.ts";

export const workflow = defineWorkflow("prepare-tests", [
  frame,
  plan,
  review,
  tests,
]);
```

```ts title="view.ts"
import type { WorkflowResult } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";
import { branch } from "./branch.ts";
import { tests } from "./tests.ts";

export function view(result: WorkflowResult) {
  if (result.status === "waiting-input")
    return { questions: result.inputRequests };
  if (result.status === "paused") return { plan: result.value(plan) };
  result.unwrap();
  return { branch, summary: result.value(tests).summary };
}
```

```ts title="start.ts"
import { workflow } from "./workflow.ts";
import { view } from "./view.ts";
import { checkpoint } from "./checkpoint.ts";
import { closeWorkbench } from "./workbench.ts";

export async function start(
  options: Parameters<typeof workflow.start>[0] = {},
) {
  try {
    return view(await workflow.start({ ...options, checkpoint }));
  } finally {
    await closeWorkbench();
  }
}
export const progress = () => start();
```

## Answer and approve

Your application calls `answer("owner", requestId, text)` for a pending question, then `decide("owner", "approve", reason)` after reviewing the plan. Use `reject` to stop. Each call advances the workflow and closes the sandbox before returning.

<!-- tabs -->

```ts title="answer.ts"
import { workflow } from "./workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { start } from "./start.ts";

export async function answer(actor: string, requestId: string, value: string) {
  const { inputRequests } = await workflow.start({ checkpoint });
  const request = inputRequests.find((pending) => pending.id === requestId);
  if (!request) throw new Error("This question is no longer pending");
  const { executionId, key } = request;
  return start({ answers: [{ executionId, key, requestId, actor, value }] });
}
```

```ts title="decide.ts"
import { workflow } from "./workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { start } from "./start.ts";

export async function decide(
  actor: string,
  action: "approve" | "reject",
  reason: string,
) {
  const current = await workflow.start({ checkpoint });
  const pending = current.tasks.find((task) => task.key === "review")?.pause;
  if (!pending) throw new Error("No plan awaits review");
  const { executionId } = current;
  const requestId = pending.id;
  const decision = { executionId, key: "review", requestId, actor, reason };
  return start({ decisions: [{ ...decision, action }] });
}
```

```ts title="run.ts"
import { progress } from "./start.ts";
import { answer } from "./answer.ts";
import { decide } from "./decide.ts";

export { progress } from "./start.ts";
export { answer } from "./answer.ts";
export { decide } from "./decide.ts";
```

Run `node main.ts` to inspect the next question, pending plan or result. Authenticate the caller before accepting the `owner` actor in an application.

```ts title="main.ts"
import { progress } from "./run.ts";

console.log(await progress());
```

## Inspect the result

After approval and an accepted check, the named branch contains a test commit and `summary` describes the changes. Nothing is merged. Run `npm test` on that branch and inspect why it fails: this example checks only a nonzero exit status, which can also come from a broken test runner. Verify that the failure demonstrates the missing behavior.

The loop allows four rounds. A rejected check leaves changes for the next attempt; exhaustion fails the task and retains the work. File checks examine the final changes, but instructions not to commit are not a security boundary. After interruption, inspect the branch before authorizing replay.

Continue with [implementation and review](../development-workflow/). That larger graph starts under a fresh ticket key; it reuses these files, not this lesson’s checkpoint.
