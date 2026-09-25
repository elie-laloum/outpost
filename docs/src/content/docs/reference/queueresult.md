---
title: "QueueResult"
description: "QueueResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                  | Presence | Meaning                                                                     |
| ------- | --------------------- | -------- | --------------------------------------------------------------------------- |
| `value` | `WorkflowJson`        | Required | Lossless JSON output produced by the worker handler.                        |
| `usage` | `Usage \| undefined`  | Optional | Reported usage counters; not a currency estimate.                           |
| `error` | `string \| undefined` | Optional | Worker failure message; when present, completion records the job as failed. |

## Signature

```ts
export interface QueueResult {
  readonly value: WorkflowJson;
  readonly usage?: Usage;
  readonly error?: string;
}
```

## Related contracts

- [Usage](../usage/)
- [WorkflowJson](../workflowjson/)
