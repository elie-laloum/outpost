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

| Name      | Type                  | Presence | Meaning                                                                              |
| --------- | --------------------- | -------- | ------------------------------------------------------------------------------------ |
| `input`   | `WorkflowJson`        | Required | Lossless JSON input supplied to the registered job handler.                          |
| `context` | `QueueHandlerContext` | Required | Claimed queue job and cancellation signal supplied to the registered worker handler. |

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
