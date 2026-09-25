---
title: "QueueHandler"
description: "QueueHandler — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueHandler**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueHandler } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

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
