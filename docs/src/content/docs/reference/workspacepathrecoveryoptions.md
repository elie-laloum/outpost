---
title: "WorkspacePathRecoveryOptions"
description: "WorkspacePathRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspacePathRecoveryOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type   | Presence | Meaning                                                                                                       |
| ------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------------- |
| `processesStopped` | `true` | Required | Explicit assertion that the prior owner and its processes have stopped; never inferred from heartbeat expiry. |

## Signature

```ts
export interface WorkspacePathRecoveryOptions {
  readonly processesStopped: true;
}
```
