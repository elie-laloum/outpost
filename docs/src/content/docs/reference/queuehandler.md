---
title: "QueueHandler"
description: "QueueHandler — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { QueueHandler } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                  | Presence | Meaning                                        |
| --------- | --------------------- | -------- | ---------------------------------------------- |
| `input`   | `WorkflowJson`        | Required | JSON input from the job’s request.             |
| `context` | `QueueHandlerContext` | Required | Idempotency key, abort signal and claimed job. |

## Returns

`QueueResult | Promise<QueueResult>`

## Signature

```ts
export type QueueHandler = (
  input: WorkflowJson,
  context: QueueHandlerContext,
) => Promise<QueueResult> | QueueResult;
```

## Related contracts

- [QueueHandlerContext](../queuehandlercontext/)
- [QueueResult](../queueresult/)
- [WorkflowJson](../workflowjson/)
