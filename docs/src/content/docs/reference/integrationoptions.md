---
title: "IntegrationOptions"
description: "IntegrationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { IntegrationOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                            | Presence | Meaning                                                                                                                                                                                                                                                                                                                  |
| ------------ | ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onConflict` | `ConflictResolver \| undefined` | Optional | Opt-in strategy invoked once for an actual Git merge conflict, before touching the host checkout. Requires integrate mode and a workspace with no open sandbox. Dirty or changed host branches, guard refusals and other Git failures never invoke it. Without it, integration keeps its existing direct-merge behavior. |
| `signal`     | `AbortSignal \| undefined`      | Optional | Cancels integration before it starts and, with onConflict, propagates through sandbox preparation, agent resolution and verification. A refused or cancelled resolution retains both workspaces.                                                                                                                         |
| `deadlineMs` | `number \| undefined`           | Optional | Positive total deadline in milliseconds for opt-in conflict integration, default 600000. Includes preflight, allocation, resolution and verification; custom strategies must observe the supplied signal. Has no effect without onConflict.                                                                              |

## Signature

```ts
export interface IntegrationOptions {
  readonly onConflict?: ConflictResolver;
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```

## Related contracts

- [ConflictResolver](../conflictresolver/)
