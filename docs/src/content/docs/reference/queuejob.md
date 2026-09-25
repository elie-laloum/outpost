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

| Name       | Type                                                         | Presence | Meaning                                                                            |
| ---------- | ------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------- |
| `status`   | `"done" \| "failed" \| "cancelled" \| "active" \| "pending"` | Required | Durable job state: pending, active, done, failed or cancelled.                     |
| `fence`    | `number`                                                     | Required | Lease generation used to reject stale queue writers.                               |
| `worker`   | `string \| undefined`                                        | Optional | Identity of the worker claiming or owning the job lease.                           |
| `expires`  | `number \| undefined`                                        | Optional | Absolute lease expiry as a Unix timestamp in milliseconds.                         |
| `result`   | `QueueResult \| undefined`                                   | Optional | Persisted worker result, including JSON value, optional usage and failure message. |
| `id`       | `string`                                                     | Required | Durable job identity used for deduplication and lease operations.                  |
| `handler`  | `string`                                                     | Required | Registered worker handler name that will execute this JSON job.                    |
| `input`    | `WorkflowJson`                                               | Required | Lossless JSON input supplied to the registered job handler.                        |
| `deadline` | `number \| undefined`                                        | Optional | Absolute job deadline as a Unix timestamp in milliseconds.                         |

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
