---
title: "Sandbox sessions"
description: "Reuse an environment across commands and agent turns."
---

Use `createSandbox()` when commands and agent turns should share installed dependencies and files. You own the returned sandbox and must close it.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
try {
  await sandbox.dispatch({ brief: { text: "Inspect the test setup." } });
  const tests = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
  });
  console.log(tests.status, tests.stdout);
} finally {
  await sandbox.close();
}
```

## Cold and warm execution

A top-level `dispatch()` owns its sandbox and closes it after use. Each cold pass allocates a fresh environment. A sandbox’s `dispatch()` keeps the existing environment for later operations.

Reusing a sandbox shares files, not conversational context. Use [chat history](../conversations/) to resume a captured conversation.

## Ownership

A sandbox created without a workspace owns the workspace it creates. A sandbox borrowing an explicit workspace leaves that workspace open. Closing is idempotent; it waits for active operations and disposes owned resources.

Operations on one sandbox are exclusive. Await each command or dispatch. For concurrency, allocate separate sandboxes and coordinate them through [task dependencies](../task-dependencies/).

## Interactive access

`sandbox.attach()` connects a terminal to the selected agent. Docker, Podman, local execution and Daytona support interactive access; Vercel rejects it. Attach requires a real terminal and should not be treated as a headless command.

API: [createSandbox](../../reference/createsandbox/) · [Sandbox](../../reference/sandbox/) · [attach](../../reference/attach/).

## Process execution

Call `sandbox.command(command)` in an open [sandbox session](../sandbox-sessions/). The result includes `status`, `stdout` and `stderr`. A nonzero exit status is a command result: check it explicitly.

```ts title="command.mts"
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const sandbox = await createSandbox({ repository, sandboxProvider });
try {
  const result = await sandbox.command({
    executable: "node",
    arguments: ["--version"],
  });
  if (result.status !== 0) throw new Error(result.stderr);
  console.log(result.stdout.trim());
} finally {
  await sandbox.close();
}
```

For longer commands, add streaming and limits:

```ts
import type { Command } from "@elie-laloum/outpost";

const testCommand: Command = {
  executable: "npm",
  arguments: ["test"],
  deadlineMs: 120_000,
  retain: 100_000,
  observe(channel, text) {
    if (channel === "stderr") process.stderr.write(text);
  },
};
```

### Arguments and directories

`arguments` is an array passed to the executable. Shell operators do not expand automatically; invoke a shell explicitly when you need pipelines. `directory` selects the command’s working directory inside the sandbox. `variables` adds command-specific environment values; `stdin` supplies text input.

### Output and completion

`observe` streams output while `retain` bounds the retained output. A command completes when the process exits, even if its output streams closed earlier. Do not infer success from text on stdout.

### Cancellation

Supply `signal` or `deadlineMs` to stop a process. Providers terminate its process group and descendants where supported, leaving a reusable sandbox available for the next operation. A signal cannot make arbitrary JavaScript callbacks stop; custom tool and task code must cooperate.

Binary file movement belongs to provider transfer methods, not captured text output. See [File exchange](../cloud-sandboxes/).

API: [Command](../../reference/command/) · [CommandResult](../../reference/commandresult/).
