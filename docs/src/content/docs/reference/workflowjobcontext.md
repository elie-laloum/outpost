---
title: "WorkflowJobContext"
description: "WorkflowJobContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowJobContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type          | Presence | Meaning                                                                                                                                                                                      |
| ---------------- | ------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runId`          | `string`      | Required | Checkpoint run carried by the job.                                                                                                                                                           |
| `idempotencyKey` | `string`      | Required | Stable effect key of this logical job: the request’s idempotencyKey when set, otherwise the job ID shared by every lease and retry. Use it for persistent deduplication of external effects. |
| `signal`         | `AbortSignal` | Required | Cooperative cancellation for this operation.                                                                                                                                                 |
| `job`            | `QueueJob`    | Required | Claimed persisted job, including its input and lease generation.                                                                                                                             |

## Signature

```ts
export interface WorkflowJobContext extends QueueHandlerContext {
  readonly runId: string;
}
```

## Related contracts

- [QueueHandlerContext](../queuehandlercontext/)
