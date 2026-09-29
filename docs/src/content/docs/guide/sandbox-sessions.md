---
title: "Sandbox sessions"
description: "Keep one sandbox open to run agent turns, test commands and an interactive terminal in the same environment."
---

## Open a sandbox

`createSandbox()` allocates a sandbox and keeps it open until you close it. Agent turns and commands then share its files and installed dependencies. `await using` closes it when the block ends.

```ts title="session.mts"
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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

The agent edits the worktree, then `npm test` runs in the same sandbox against its changes. How this differs from a one-shot `dispatch()`, and who closes what, is explained in [How Outpost works](../how-it-works/).

## Run agent turns

`sandbox.dispatch()` takes the same brief and turn options as `dispatch()`, without the repository and sandbox settings. Each call starts a new conversation: continue one with `sandbox.resume(id, options)` or `sandbox.fork(id, options)` ([Conversations](../conversations/)).

An `agent` passed to `sandbox.dispatch()` replaces the one given to `createSandbox()`.

## Run a command

`sandbox.command()` runs one executable with an array of arguments. No shell parses them: `*`, `|` and `$HOME` reach the program as plain text. Call a shell yourself when you need one.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({ repository, sandboxProvider });
const result = await sandbox.command({
  executable: "sh",
  arguments: ["-c", "npm test 2>&1 | tail -n 20"],
  directory: `${sandbox.root}/packages/api`,
  variables: { CI: "1" },
});
console.log(result.status, result.stdout);
```

`sandbox.root` is the repository path inside the sandbox and the default working directory.

| Option       | What it does                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `executable` | Program to run, required.                                                                      |
| `arguments`  | Arguments passed as-is, without shell expansion.                                               |
| `directory`  | Working directory inside the sandbox. Defaults to `sandbox.root`.                              |
| `variables`  | Environment values for this command only ([Environment variables](../environment-variables/)). |
| `stdin`      | Text written to standard input, which then closes.                                             |
| `input`      | A `Readable` stream written after `stdin`; standard input stays open until it ends.            |
| `observe`    | Callback receiving each `stdout` or `stderr` chunk as it arrives.                              |
| `retain`     | Number of trailing characters kept per stream in the result. Defaults to 65,536.               |
| `deadlineMs` | Maximum duration before Outpost stops the process. Defaults to 10 minutes.                     |
| `signal`     | `AbortSignal` that cancels the command.                                                        |
| `elevated`   | Runs as root on providers that support it: Docker, Podman, Vercel and Daytona.                 |

## Check the outcome

A command that exits resolves with `status`, `stdout` and `stderr`, whatever its exit code. A command Outpost had to stop rejects instead.

| Outcome                               | Result                                            |
| ------------------------------------- | ------------------------------------------------- |
| Process exits, even with status 1     | Resolves; test `result.status`.                   |
| `deadlineMs` elapses                  | Rejects with an `OutpostError` of code `timeout`. |
| `signal` aborts                       | Rejects with the signal’s reason.                 |
| The sandbox closes during the command | Rejects; the process is stopped.                  |

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
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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

Attach needs a CLI agent such as Codex or Claude Code. The [built-in harness](../harness/) and [fallback agents](../fallback-agents/) are rejected.

## Integrate the work yourself

A sandbox you create never merges its branch on its own. With `branch: { mode: "integrate" }`, call `sandbox.workspace.integrate()` before closing to merge the work branch into its base.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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
