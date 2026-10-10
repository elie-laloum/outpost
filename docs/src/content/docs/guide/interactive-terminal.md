---
title: "Open an interactive agent terminal"
description: "Work with the native CLI in an open sandbox."
---

Start from [Reuse a sandbox](../sandbox-sessions/) and its configuration. Work with the native CLI in an open sandbox.

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
// Example output: 0 []
```

Run it from a real terminal. `continuation` reopens a captured conversation. The top-level [`attach()`](../../reference/attach/) opens and closes its own sandbox, and applies the branch policy when the session exits with status 0.

| Provider             | `attach()` |
| -------------------- | ---------- |
| Docker, Podman, host | Supported  |
| Daytona              | Supported  |
| Vercel, Firecracker  | Rejected   |

Attach needs a CLI agent such as Codex or Claude Code. The [built-in harness](../harness/), [fallback agents](../fallback-agents/) and [replay agents](../record-replay/) are rejected.
