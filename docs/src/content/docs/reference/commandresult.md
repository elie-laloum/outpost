---
title: "CommandResult"
description: "CommandResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CommandResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type     | Presence | Meaning                                  |
| -------- | -------- | -------- | ---------------------------------------- |
| `status` | `number` | Required | Process exit code; zero denotes success. |
| `stdout` | `string` | Required | Captured standard output.                |
| `stderr` | `string` | Required | Captured standard error.                 |

## Signature

```ts
export interface CommandResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}
```
