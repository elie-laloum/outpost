---
title: "LifecycleHooks"
description: "LifecycleHooks — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LifecycleHooks } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                       | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | ------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspaceReady` | `readonly LifecycleCommand[] \| undefined` | Optional | Host commands run one after another in the worktree once it is prepared and copies are in place, before any sandbox. A failure closes the workspace and rejects the open; ignored when the sandbox receives an open workspace.                                                                                                                                        |
| `hostReady`      | `readonly LifecycleCommand[] \| undefined` | Optional | Host commands run one after another in the worktree after each sandbox is allocated, at the same time as sandboxReady. The first failure stops both groups and the sandbox allocation fails. With when: changed(files), checked again before each warm command, dispatch or attachment; successful fingerprints are scoped to this sandbox.                           |
| `sandboxReady`   | `readonly LifecycleCommand[] \| undefined` | Optional | Commands started together inside the sandbox, in the repository root, once the repository is in place, at the same time as hostReady; chain dependent steps in one shell command. The first failure stops both groups. With when: changed(files), checked again before each warm command, dispatch or attachment; successful fingerprints are scoped to this sandbox. |

## Signature

```ts
export interface LifecycleHooks {
  readonly workspaceReady?: readonly LifecycleCommand[];
  readonly hostReady?: readonly LifecycleCommand[];
  readonly sandboxReady?: readonly LifecycleCommand[];
}
```

## Related contracts

- [LifecycleCommand](../lifecyclecommand/)
