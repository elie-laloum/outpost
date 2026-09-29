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

| Name             | Type                              | Presence | Meaning                                                                                                                                                                        |
| ---------------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workspaceReady` | `readonly Command[] \| undefined` | Optional | Host commands run after workspace preparation, before sandbox allocation.                                                                                                      |
| `hostReady`      | `readonly Command[] \| undefined` | Optional | Host commands run one after another after sandbox allocation, at the same time as sandboxReady; the first failure stops both groups.                                           |
| `sandboxReady`   | `readonly Command[] \| undefined` | Optional | Commands started together inside the sandbox after allocation, at the same time as hostReady; chain dependent steps in one shell command. The first failure stops both groups. |

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
