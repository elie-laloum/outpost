---
title: "LifecycleHooks"
description: "LifecycleHooks — Outpost API"
sidebar:
  order: 10
---

Public contract for **LifecycleHooks**. See the [workspaces guide](../../guide/environment/workspaces/) for behavior, defaults and examples.

## Import

```ts
import type { LifecycleHooks } from "@elie-laloum/outpost";
```

## Purpose and behavior

Own a repository checkout, branch and lock independently of sandbox lifetime.

Repository defaults to the current working directory. Named branches retain commits; dirty or detached worktrees remain recoverable. Close the sandbox before its caller-owned workspace.

[Complete example and detailed rules](../../guide/environment/workspaces/).

## Parameters and properties

| Name             | Type                              | Presence | Meaning                                                                 |
| ---------------- | --------------------------------- | -------- | ----------------------------------------------------------------------- |
| `workspaceReady` | `readonly Command[] \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `hostReady`      | `readonly Command[] \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `sandboxReady`   | `readonly Command[] \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

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
