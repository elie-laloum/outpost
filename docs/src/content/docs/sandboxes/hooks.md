---
title: "Setup hooks and copied inputs"
description: "Setup hooks and copied inputs — Outpost"
sidebar:
  order: 5
---

Hooks prepare resources at explicit lifecycle stages. Supply arrays of `Command` objects; no command is interpreted as a shell script automatically.

```ts
import { createSandbox, codex } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: codex(),
  copies: [".env.test"],
  hooks: {
    workspaceReady: [{ executable: "git", arguments: ["status", "--short"] }],
    sandboxReady: [
      { executable: "npm", arguments: ["ci"], deadlineMs: 180_000 },
    ],
  },
});
```

## Execution order

1. Create or acquire the Git workspace and copy selected inputs.
2. Run `workspaceReady` commands on the host, in order.
3. Acquire the provider and prepare remote synchronization when applicable.
4. Run `hostReady` and `sandboxReady` groups concurrently.
5. Start agent or command operations.

Within a host group, commands are sequential. Within `sandboxReady`, commands run concurrently. Put dependent shell steps into a single explicit shell command, or combine them into a project script. A hook failure cancels sibling hooks and waits for cleanup before provisioning fails.

A standalone `openWorkspace({ hooks })` runs `workspaceReady` immediately; subsequent sandboxes do not repeat that hook. Cold multi-pass dispatch creates a new sandbox per pass, while a warm dispatch reuses its prepared environment.

Each command may supply `directory`, `variables`, `deadlineMs` and `signal`. Sandbox hooks may request `elevated: true` where supported. A failed initialization preserves dirty work and removes clean owned workspaces. See [recovery](../../operations/recovery/).
