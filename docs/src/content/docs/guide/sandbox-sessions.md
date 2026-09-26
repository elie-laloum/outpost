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

Reusing a sandbox shares files, not conversational context. Use [chat history](../chat-history/) to resume a captured conversation.

## Ownership

A sandbox created without a workspace owns the workspace it creates. A sandbox borrowing an explicit workspace leaves that workspace open. Closing is idempotent; it waits for active operations and disposes owned resources.

Operations on one sandbox are exclusive. Await each command or dispatch. For concurrency, allocate separate sandboxes and coordinate them through [task dependencies](../task-dependencies/).

## Interactive access

`sandbox.attach()` connects a terminal to the selected agent. Docker, Podman, local execution and Daytona support interactive access; Vercel rejects it. Attach requires a real terminal and should not be treated as a headless command.

API: [createSandbox](../../reference/createsandbox/) · [Sandbox](../../reference/sandbox/) · [attach](../../reference/attach/).
