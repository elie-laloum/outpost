---
title: "Reuse a sandbox"
description: "Keep an environment open for agent turns, commands and tests on the same files."
---

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
console.log(result.stdout.trim()); // v24.15.0
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

## Open an interactive terminal

`sandbox.attach()` starts the agent’s own CLI in your terminal, inside the sandbox. You work with it by hand; the call resolves when you quit, with `status` and the `commits` made during the session.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
const session = await sandbox.attach({
  brief: { text: "Walk me through the payment module." },
});
console.log(session.status, session.commits);
```

Run it from a real terminal. `continuation` reopens a captured conversation. The top-level [`attach()`](../../reference/attach/) opens and closes its own sandbox, and applies the branch policy when the session exits with status 0.

| Provider             | `attach()` |
| -------------------- | ---------- |
| Docker, Podman, host | Supported  |
| Daytona              | Supported  |
| Vercel, Firecracker  | Rejected   |

Attach needs a CLI agent such as Codex or Claude Code. The [built-in harness](../harness/), [fallback agents](../fallback-agents/) and [replay agents](../record-replay/) are rejected.

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

## Limits

- A sandbox runs one operation at a time: a second call made while one runs is rejected, not queued. Use separate sandboxes for parallel work.
- Output is captured as text. Move binary files with the provider’s transfer methods ([Cloud sandboxes](../cloud-sandboxes/)).

API: [createSandbox](../../reference/createsandbox/) · [Sandbox](../../reference/sandbox/) · [Command](../../reference/command/) · [CommandResult](../../reference/commandresult/) · [AttachOptions](../../reference/attachoptions/) · [attach](../../reference/attach/).
