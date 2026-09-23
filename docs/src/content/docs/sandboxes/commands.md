---
title: "Commands and terminal sessions"
description: "Commands and terminal sessions — Outpost"
sidebar:
  order: 4
---

`sandbox.command()` runs an executable and returns its status and captured output. A nonzero status is returned, not thrown as an agent failure.

```ts
import { createSandbox, codex } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({ agent: codex() });
const result = await sandbox.command({
  executable: "npm",
  arguments: ["test"],
  variables: { CI: "true" },
  deadlineMs: 120_000,
  retain: 65_536,
  observe: (channel, text) => process.stdout.write(`${channel}: ${text}`),
});
console.log(result.status, result.stdout, result.stderr);
```

Arguments are passed directly; shell substitutions require an explicit shell such as `sh -c`. `directory` defaults to the sandbox workspace. `stdin` supplies text. `retain` limits the retained tail of each output stream, while `observe` receives all output. `signal` cancels the command. `elevated` requests provider-supported elevation; the host adapter never elevates privileges.

## Attach an agent

```ts
import { attach, claude } from "@elie-laloum/outpost";

const session = await attach({
  agent: claude(),
  branch: { mode: "named", name: "feature/interactive" },
  brief: { text: "Help me review this branch." },
});
console.log(session.status, session.commits);
```

Use `sandbox.attach()` to keep the environment afterward. `continuation: { id, fork? }` opens a native conversation. File briefs can ask for missing variables in the TTY or through async `ask(name)`. Values already supplied are preserved.

Docker, Podman and local execution support interactive attachment; Vercel and Daytona explicitly reject it. `terminal: { input, output, error }` lets callers own the streams. Terminal raw mode and cursor visibility are restored on exit. Attachment results include `status`, output, commits, branch, directory and available disposal information.
