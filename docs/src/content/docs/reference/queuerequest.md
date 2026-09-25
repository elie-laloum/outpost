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

| Name       | Type                  | Presence | Meaning                                                           |
| ---------- | --------------------- | -------- | ----------------------------------------------------------------- |
| `id`       | `string`              | Required | Durable job identity used for deduplication and lease operations. |
| `handler`  | `string`              | Required | Registered worker handler name that will execute this JSON job.   |
| `input`    | `WorkflowJson`        | Required | Lossless JSON input supplied to the registered job handler.       |
| `deadline` | `number \| undefined` | Optional | Absolute job deadline as a Unix timestamp in milliseconds.        |

## Signature

```ts
export interface QueueRequest {
  readonly id: string;
  readonly handler: string;
  readonly input: WorkflowJson;
  readonly deadline?: number;
}
```

## Related contracts

- [WorkflowJson](../workflowjson/)
