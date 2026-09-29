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
| `signal`         | `AbortSignal` | Required | Aborts when the worker stops or a lease renewal fails, for example after a cancellation, a passed deadline or a lost lease. Pass it to every operation the handler starts.                   |
| `job`            | `QueueJob`    | Required | Job as claimed, with its request and current fence.                                                                                                                                          |

## Signature

```ts
export interface WorkflowJobContext extends QueueHandlerContext {
  readonly runId: string;
}
```

## Related contracts

- [QueueHandlerContext](../queuehandlercontext/)
