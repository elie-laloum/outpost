---
title: "LifecycleHooks"
description: "LifecycleHooks — Outpost API"
sidebar:
  order: 10
---

Public contract for **LifecycleHooks**. See the [workspaces guide](../../sandboxes/workspaces/) for behavior, defaults and examples.

## Import

```ts
import type { LifecycleHooks } from "@elie-laloum/outpost";
```

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
