---
title: "QueueHandlerContext"
description: "QueueHandlerContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueHandlerContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type          | Presence | Meaning                                                          |
| -------- | ------------- | -------- | ---------------------------------------------------------------- |
| `signal` | `AbortSignal` | Required | Cooperative cancellation for this operation.                     |
| `job`    | `QueueJob`    | Required | Claimed persisted job, including its input and lease generation. |

## Signature

```ts
export interface QueueHandlerContext {
  readonly signal: AbortSignal;
  readonly job: QueueJob;
}
```

## Related contracts

- [QueueJob](../queuejob/)
