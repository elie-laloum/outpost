---
title: "QueueRequest"
description: "QueueRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueRequest } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                  | Presence | Meaning                                                                                                                                                          |
| ---------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | `string`              | Required | Job ID, 1 to 512 characters and unique in the queue; enqueuing it again returns the stored job.                                                                  |
| `idempotencyKey` | `string \| undefined` | Optional | Effect key passed to the handler instead of the job ID; defineQueuedTask sets it to the original key when a quota pause republishes the task under a new job ID. |
| `handler`        | `string`              | Required | Name of the worker handler that runs the job, 1 to 512 characters.                                                                                               |
| `input`          | `WorkflowJson`        | Required | JSON input passed to the handler, at most 262144 bytes serialized.                                                                                               |
| `deadline`       | `number \| undefined` | Optional | Time in epoch milliseconds after which a pending or active job becomes cancelled; leases never extend past it.                                                   |

## Signature

```ts
export interface QueueRequest {
  readonly id: string;
  /** Stable effect key for handlers when the job id differs, such as after a quota pause. */
  readonly idempotencyKey?: string;
  readonly handler: string;
  readonly input: WorkflowJson;
  readonly deadline?: number;
}
```

## Related contracts

- [WorkflowJson](../workflowjson/)
