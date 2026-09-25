---
title: "QueueJob"
description: "QueueJob — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueJob**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueJob } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name       | Type                                                         | Presence | Meaning                                                                 |
| ---------- | ------------------------------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `status`   | `"done" \| "failed" \| "cancelled" \| "active" \| "pending"` | Required | Recorded process or lifecycle outcome; inspect its declared type.       |
| `fence`    | `number`                                                     | Required | Lease generation used to reject stale queue writers.                    |
| `worker`   | `string \| undefined`                                        | Optional | See the linked contract and this family's rules for its interpretation. |
| `expires`  | `number \| undefined`                                        | Optional | See the linked contract and this family's rules for its interpretation. |
| `result`   | `QueueResult \| undefined`                                   | Optional | See the linked contract and this family's rules for its interpretation. |
| `id`       | `string`                                                     | Required | See the linked contract and this family's rules for its interpretation. |
| `handler`  | `string`                                                     | Required | See the linked contract and this family's rules for its interpretation. |
| `input`    | `WorkflowJson`                                               | Required | See the linked contract and this family's rules for its interpretation. |
| `deadline` | `number \| undefined`                                        | Optional | See the linked contract and this family's rules for its interpretation. |

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
