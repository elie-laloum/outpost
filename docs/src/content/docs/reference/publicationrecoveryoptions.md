---
title: "PublicationRecoveryOptions"
description: "PublicationRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { PublicationRecoveryOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                | Presence | Meaning                                                                                                       |
| ------------------ | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `processesStopped` | `true \| undefined` | Optional | Explicit assertion that the prior owner and its processes have stopped; never inferred from heartbeat expiry. |

## Signature

```ts
export interface PublicationRecoveryOptions {
  readonly processesStopped?: true;
}
```
