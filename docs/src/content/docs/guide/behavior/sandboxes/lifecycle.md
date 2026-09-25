---
title: "Reusable sandboxes"
description: "Reusable sandboxes — Outpost"
sidebar:
  order: 1
---

Keep a sandbox warm when sequential jobs need the same environment. Provisioning, installation and setup hooks run once for that sandbox.

```ts
import { createSandbox, codex, claude } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: codex(),
  branch: { mode: "named", name: "feature/validation" },
});
const implementation = await sandbox.dispatch({
  brief: { text: "Implement validation and commit it." },
});
await sandbox.dispatch({
  agent: claude(),
  brief: { text: "Review the implementation, run tests and commit any fixes." },
});
console.log(implementation.commits, sandbox.workspace.branch);
```

Docker is the default provider. Supply `provider` to select another backend. The default agent is optional: you can pass an adapter to each `dispatch` or `attach` instead. Each job receives its selected adapter’s variables, including when switching agents.

## Closing and cancellation

`await using` closes the sandbox at scope exit, including on errors. With explicit ownership, call `await sandbox.close()` in `finally`. `close({ preserve: true })` retains an owned workspace. Closing waits for active work and performs cleanup; overlapping operational calls are rejected rather than queued.

The `signal` passed to `createSandbox` controls provisioning. Pass a signal to each later operation to cancel that operation. A command timeout or dispatch cancellation does not by itself destroy a warm sandbox. Read [timeouts](../../../agents/cancellation/) for the distinct deadlines.

`sandbox.root` is the working directory inside the execution environment. `sandbox.workspace.directory` is its host Git directory. They differ for containers and remote providers.

For an integration workspace, call `sandbox.workspace.integrate()` explicitly when warm work should enter the host branch. Review and commit the intended changes first. The [workspace guide](../../../environment/workspaces/) explains separate ownership.
