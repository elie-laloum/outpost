---
title: "Setup hooks"
description: "Prepare a workspace and sandbox before running work."
---

Pass `hooks` to workspace or sandbox options to run setup commands. They run in declared order, and a failed command stops preparation.

```ts
import type { LifecycleHooks } from "@elie-laloum/outpost";

const hooks: LifecycleHooks = {
  workspaceReady: [{ executable: "git", arguments: ["status", "--short"] }],
  sandboxReady: [{ executable: "npm", arguments: ["ci"] }],
};
```

## Choose the execution location

| Hook             | Runs                                             |
| ---------------- | ------------------------------------------------ |
| `workspaceReady` | On the host after the Git workspace is prepared. |
| `hostReady`      | On the host during sandbox preparation.          |
| `sandboxReady`   | Inside the allocated sandbox before agent work.  |

Install project dependencies in `sandboxReady` so they match the execution environment. Use `workspaceReady` for host-side preparation that belongs to the workspace’s lifetime.

A warm sandbox does not rerun setup before every turn. Cold allocation runs its setup again. Cache package downloads with [dependency volumes](../persistent-caches/) when repeated installation is expensive.

These hooks execute commands. Model-loop hooks instead intercept tool calls and model events: see [Tool policies](../tool-policies/).

API: [LifecycleHooks](../../reference/lifecyclehooks/).
