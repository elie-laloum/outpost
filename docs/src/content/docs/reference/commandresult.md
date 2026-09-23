---
title: "CommandResult"
description: "CommandResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **CommandResult**. See the [commands and terminal guide](../../sandboxes/commands/) for behavior, defaults and examples.

## Import

```ts
import type { CommandResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface CommandResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}
```
