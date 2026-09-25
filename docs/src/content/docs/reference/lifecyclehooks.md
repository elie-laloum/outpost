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

| Name             | Type                              | Presence | Meaning                                                                   |
| ---------------- | --------------------------------- | -------- | ------------------------------------------------------------------------- |
| `workspaceReady` | `readonly Command[] \| undefined` | Optional | Host commands run after workspace preparation, before sandbox allocation. |
| `hostReady`      | `readonly Command[] \| undefined` | Optional | Host commands run after environment acquisition and before sandboxReady.  |
| `sandboxReady`   | `readonly Command[] \| undefined` | Optional | Commands run inside the acquired sandbox after host preparation.          |

## Signature

```ts
export interface LifecycleHooks {
  readonly workspaceReady?: readonly Command[];
  readonly hostReady?: readonly Command[];
  readonly sandboxReady?: readonly Command[];
}
```

## Related contracts

- [Command](../command/)
