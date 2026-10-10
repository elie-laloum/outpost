---
title: "Reuse a sandbox"
description: "Keep an environment open for agent turns, commands and tests on the same files."
---

Start with the [agent configuration](../setup/) and a project whose test command is available in the sandbox. [Prepare dependencies](../environment-setup/) before running the check. A command result must be checked: receiving stdout alone does not mean it succeeded.

## Open a sandbox

Open a sandbox with `createSandbox()` when several operations need the same files and installed dependencies. `await using` closes it at the end of the scope, including when an operation throws.

```ts title="session.ts"
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
await sandbox.dispatch({ brief: { text: "Fix the failing date tests." } });
const tests = await sandbox.command({
  executable: "npm",
  arguments: ["test"],
});
console.log(tests.status === 0 ? "Tests pass" : tests.stderr);
// Example output: Tests pass
```

The agent edits the worktree, then `npm test` runs in the same sandbox against its changes. How this differs from a one-shot `dispatch()`, and who closes what, is explained in [How it works](../how-it-works/).

## Run agent turns

`sandbox.dispatch()` takes the same brief and turn options as `dispatch()`, without the repository and sandbox settings. Each call starts a new conversation: continue one with `sandbox.resume(id, options)` or `sandbox.fork(id, options)` ([Conversations](../conversations/)).

An `agent` passed to `sandbox.dispatch()` replaces the one given to `createSandbox()`.

## Run a command

`sandbox.command()` runs one executable with an array of arguments. No shell parses them: `*`, `|` and `$HOME` reach the program as plain text. Call a shell yourself when you need one.

```ts title="command.ts"
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({ repository, sandboxProvider });
const result = await sandbox.command({
  executable: "sh",
  arguments: ["-c", "node --version | tail -n 1"],
  variables: { CI: "1" },
});
console.log(result.stdout.trim());
// Example output: v24.15.0
```

`sandbox.root` is the repository path inside the sandbox and the default working directory.

API reference: [Command](../../reference/command/).

## Check the outcome

A command that exits resolves with `status`, `stdout` and `stderr`, whatever its exit code. A command Outpost had to stop rejects instead.

| Outcome                               | Result                                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Process exits, even with status 1     | Resolves; test `result.status`.                                                                 |
| `deadlineMs` elapses                  | Rejects with an `OutpostError` of code `timeout`; on Vercel and Daytona, with a `TimeoutError`. |
| `signal` aborts                       | Rejects with the signal’s reason.                                                               |
| The sandbox closes during the command | Rejects; the process is stopped.                                                                |

The result waits for the process to exit, not for its output to close. Read `status` rather than guessing success from `stdout`. Error codes are listed in [Errors](../error-handling/).

## Stream a long command

`observe` shows output while the command runs. `retain` only bounds what the result keeps, not what `observe` receives.

```ts
import type { Command } from "@elie-laloum/outpost";

const build: Command = {
  executable: "npm",
  arguments: ["run", "build"],
  deadlineMs: 120_000,
  observe(channel, text) {
    (channel === "stderr" ? process.stderr : process.stdout).write(text);
  },
};
```

Pass it to `sandbox.command(build)`. Stopping a command terminates its process group and its descendants. The sandbox stays open for the next operation.

:::caution
An exception thrown inside `observe` stops the command, which then rejects with that exception.
:::

<span id="open-an-interactive-terminal"></span>

For this step, follow [Open an interactive agent terminal](../interactive-terminal/).

## Integrate the work yourself

A sandbox you create never merges its branch on its own. With `branch: { mode: "integrate" }`, call `sandbox.workspace.integrate()` before closing to merge the work branch into its base.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "integrate" },
});
await sandbox.dispatch({
  brief: { text: "Fix the failing tests and commit." },
});
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
if (tests.status === 0) await sandbox.workspace.integrate();
```

With other branch modes, `integrate()` does nothing. A merge conflict, or a host branch switched during the run, rejects with code `conflict` and keeps the worktree. `close({ preserve: true })` also keeps it for inspection ([Recover work](../recovery/)).

## File workspaces

File sandboxes borrow an open `FileWorkspace` or own an explicit `workspaceSource`. Closing a borrowed sandbox leaves its workspace open. [File workspaces](../workspaces/) explains provider bindings, output publication and retention.

## Limits

- A sandbox runs one operation at a time: a second call made while one runs is rejected, not queued. Use separate sandboxes for parallel work.
- Output is captured as text. Move binary files with the provider’s transfer methods ([Cloud sandboxes](../cloud-sandboxes/)).

API: [createSandbox](../../reference/createsandbox/) · [Sandbox](../../reference/sandbox/) · [Command](../../reference/command/) · [CommandResult](../../reference/commandresult/) · [AttachOptions](../../reference/attachoptions/) · [attach](../../reference/attach/).

## Share a sandbox between tasks

`defineAgentTask()` and `defineCommandTask()` run in a sandbox you opened with [`createSandbox()`](../sandbox-sessions/). The tasks share its files; you close it.

<!-- tabs -->

```ts title="fix-dates.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";

export function defineFix(sandbox: Sandbox) {
  return defineAgentTask({
    key: "fix",
    sandbox,
    request: () => ({ brief: { text: "Fix the failing date tests." } }),
  });
}
```

```ts title="test-dates.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineFix } from "./fix-dates.ts";
import { defineCommandTask } from "@elie-laloum/outpost";

export function defineTests(
  sandbox: Sandbox,
  fix: ReturnType<typeof defineFix>,
) {
  return defineCommandTask({
    key: "test",
    after: [fix],
    sandbox,
    command: { executable: "npm", arguments: ["test"] },
  });
}
```

```ts title="run-dates.ts"
import { createSandbox, defineWorkflow } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";
import { defineFix } from "./fix-dates.ts";
import { defineTests } from "./test-dates.ts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/check-dates" },
  hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
});
export const fix = defineFix(sandbox);
export const test = defineTests(sandbox, fix);
export const result = await defineWorkflow("fix-dates", [fix, test]).start();
result.unwrap();
```

`test` runs `npm test` on the agent’s edits. A nonzero exit status fails the task.
