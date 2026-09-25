---
title: "QueueRequest"
description: "QueueRequest — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueRequest**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueRequest } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name       | Type                  | Presence | Meaning                                                                 |
| ---------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `id`       | `string`              | Required | See the linked contract and this family's rules for its interpretation. |
| `handler`  | `string`              | Required | See the linked contract and this family's rules for its interpretation. |
| `input`    | `WorkflowJson`        | Required | See the linked contract and this family's rules for its interpretation. |
| `deadline` | `number \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

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
