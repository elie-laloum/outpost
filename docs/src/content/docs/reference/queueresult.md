---
title: "QueueResult"
description: "QueueResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueResult**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name    | Type                  | Presence | Meaning                                                                 |
| ------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `value` | `WorkflowJson`        | Required | Typed value produced or consumed by this contract.                      |
| `usage` | `Usage \| undefined`  | Optional | Reported usage counters; not a currency estimate.                       |
| `error` | `string \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

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
