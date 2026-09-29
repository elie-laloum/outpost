---
title: "ShellToolsOptions"
description: "ShellToolsOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ShellToolsOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                  | Presence | Meaning                                                                                                           |
| ------------ | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `deadlineMs` | `number \| undefined` | Optional | Deadline of each shell command, default 120000 (2 minutes). toolExecution.deadlineMs still bounds the whole call. |

## Signature

```ts
export interface ShellToolsOptions {
  readonly deadlineMs?: number;
}
```
