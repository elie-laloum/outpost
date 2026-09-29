---
title: "QueueJob"
description: "QueueJob — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueJob } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                                         | Presence | Meaning                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`         | `"failed" \| "active" \| "done" \| "cancelled" \| "pending"` | Required | pending until claimed, active while leased, then done, failed or cancelled. The queue never retries a failed job.                                                |
| `fence`          | `number`                                                     | Required | Lease generation: 0 at enqueue, incremented by each claim, cancellation and deadline expiry. renew() and complete() must present the current value.              |
| `worker`         | `string \| undefined`                                        | Optional | Name of the worker that last claimed the job.                                                                                                                    |
| `expires`        | `number \| undefined`                                        | Optional | Lease expiry in epoch milliseconds; once it passes, another worker can claim the job.                                                                            |
| `result`         | `QueueResult \| undefined`                                   | Optional | Result stored by complete(), present once the job is done or failed.                                                                                             |
| `id`             | `string`                                                     | Required | Job ID, 1 to 512 characters and unique in the queue; enqueuing it again returns the stored job.                                                                  |
| `idempotencyKey` | `string \| undefined`                                        | Optional | Effect key passed to the handler instead of the job ID; defineQueuedTask sets it to the original key when a quota pause republishes the task under a new job ID. |
| `handler`        | `string`                                                     | Required | Name of the worker handler that runs the job, 1 to 512 characters.                                                                                               |
| `input`          | `WorkflowJson`                                               | Required | JSON input passed to the handler, at most 262144 bytes serialized.                                                                                               |
| `deadline`       | `number \| undefined`                                        | Optional | Time in epoch milliseconds after which a pending or active job becomes cancelled; leases never extend past it.                                                   |

## Signature

```ts
export interface QueueJob extends QueueRequest {
  readonly status: "pending" | "active" | "done" | "failed" | "cancelled";
  readonly fence: number;
  readonly worker?: string;
  readonly expires?: number;
  readonly result?: QueueResult;
}
```

## Related contracts

- [QueueRequest](../queuerequest/)
- [QueueResult](../queueresult/)
