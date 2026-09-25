---
title: "CommandResult"
description: "CommandResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **CommandResult**. See the [commands and terminal guide](../../guide/environment/commands/) for behavior, defaults and examples.

## Import

```ts
import type { CommandResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run a process or attach a native interactive agent session with explicit stream ownership.

Command returns nonzero exit statuses; callers must check them. Attach requires a supported interactive provider. Vercel rejects attachment.

[Complete example and detailed rules](../../guide/environment/commands/).

## Parameters and properties

| Name     | Type     | Presence | Meaning                                                           |
| -------- | -------- | -------- | ----------------------------------------------------------------- |
| `status` | `number` | Required | Recorded process or lifecycle outcome; inspect its declared type. |
| `stdout` | `string` | Required | Captured standard output.                                         |
| `stderr` | `string` | Required | Captured standard error.                                          |

## Signature

```ts
export interface CommandResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}
```
