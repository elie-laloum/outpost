---
title: "Disposal"
description: "Disposal — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Disposal } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                  | Presence | Meaning                                                                                                                                                                                               |
| ------------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retainedDirectory` | `string \| undefined` | Optional | Worktree kept on close: set when preserve was requested, or when it has a detached HEAD or uncommitted, untracked or ignored files. Absent when the worktree was removed, and always in current mode. |

## Signature

```ts
export interface Disposal {
  readonly retainedDirectory?: string;
}
```
