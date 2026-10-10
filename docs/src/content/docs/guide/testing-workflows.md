---
title: "Test workflows offline"
description: "Exercise workflow branches, retries and commits in CI with a scripted agent and simulated sandbox commands."
---

## Replace the agent in your test

Import the test kit from `@elie-laloum/outpost/testing` and pass its sandbox provider explicitly. It requires Node.js 24+ and Git, with no account, container, model request or network connection. Use a disposable Git repository with an initial commit: scripted commits change real files and Git history.

Save the agent fixture as `coder.ts`. Its first request emits the answer and creates the declared commit; a second request fails because the script is exhausted. Create a fresh agent for each independent test.

```ts title="coder.ts"
import { scriptedAgent } from "@elie-laloum/outpost/testing";

export const coder = scriptedAgent({
  turns: [
    {
      text: "Done",
      commit: {
        message: "fix: parser",
        files: { "src/p.ts": "export const parse = () => true;\n" },
      },
    },
  ],
});
```

Use your temporary repository path in `workflow.test.ts`, then run `node --test workflow.test.ts`. The assertion checks a real commit collected by the normal dispatch lifecycle. Dispatch releases its simulated sandbox; the test owns and removes the temporary repository afterward.

```ts title="workflow.test.ts"
import assert from "node:assert/strict";
import test from "node:test";
import { dispatch } from "@elie-laloum/outpost";
import { createMemorySandboxProvider } from "@elie-laloum/outpost/testing";
import { coder } from "./coder.ts";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

test("coder commits the fix", async (t) => {
  const repository = await mkdtemp(join(tmpdir(), "outpost-test-"));
  t.after(() => rm(repository, { recursive: true, force: true }));
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", repository, ...args]);
  git("init");
  git("config", "user.name", "Outpost test");
  git("config", "user.email", "test@example.invalid");
  git("commit", "--allow-empty", "-m", "Initial commit");
  const result = await dispatch({
    repository,
    agent: coder,
    sandboxProvider: createMemorySandboxProvider(),
    brief: { text: "Fix the parser." },
    logging: false,
  });
  assert.equal(result.commits.length, 1);
});
```

## Exercise retries and accounting

Give a failing turn a nonzero status, followed by a successful turn. Your existing workflow retry policy consumes the next turn on its next attempt. Supplied usage flows through the normal workflow budgets; omitted usage contributes complete zero counters. Events can simulate tools, quota failures and other decoded agent output. A failed turn can still make a declared commit, allowing tests of partial progress.

This agent fails once, then returns the requested answer. Both warm dispatches and new sandboxes consume the same agent's sequence; response repairs also consume turns. Repairs and conversation resume work inside the same open sandbox. Conversation capture, cold resume and fork are unavailable.

```ts
import { scriptedAgent } from "@elie-laloum/outpost/testing";

const agent = scriptedAgent({
  turns: [
    { status: 7, stderr: "Simulated failure\n" },
    { text: "Done", usage: { input: 10, cached: 0, output: 5 } },
  ],
});
```

## Simulate verification commands

Provide the results of commands that your workflow runs in its sandbox. Every invocation must match the next fixture's executable and arguments exactly; a mismatch fails without consuming that entry. The queue is shared across leases from the same provider. Scripted agent turns do not consume command fixtures. Create a fresh provider to reset the queue.

This fixture lets a `defineCommandTask()` running `npm test` succeed without launching npm. A nonzero fixture status follows the task's normal failure and retry behavior. It tests workflow orchestration; it does not validate the project tests themselves.

```ts
import { createMemorySandboxProvider } from "@elie-laloum/outpost/testing";

const sandboxProvider = createMemorySandboxProvider({
  commands: [
    {
      executable: "npm",
      arguments: ["test"],
      stdout: "Tests passed\n",
    },
  ],
});
```

The provider never launches arbitrary commands. Host hooks and prompt command expansion still run on the host through Outpost's normal lifecycle: omit them from offline fixtures or inject test implementations. File transfers, terminals, live input and elevation are refused. The provider simulates execution and does not enforce filesystem or network isolation. Git integration, guards, cancellation and workflow policies still use their normal application paths.

Run the complete repository example with `node examples/62-workflow-testing/index.ts` from a built Outpost checkout. It creates and removes its own temporary repository, checks one retry and a real commit, and simulates verification without paid calls.

API: [scriptedAgent](../../reference/scriptedagent/) · [ScriptedTurn](../../reference/scriptedturn/) · [ScriptedCommit](../../reference/scriptedcommit/) · [createMemorySandboxProvider](../../reference/creatememorysandboxprovider/) · [MemoryCommand](../../reference/memorycommand/).

## File workspaces

File fixtures can use ephemeral workspaces and scripted agents without creating a Git repository. Memory still refuses unsupported transfers. Publication/recovery use real temporary directories; mounted filesystem guarantees require real Docker/Podman tests. See [file workspaces](../workspaces/).
