---
title: "runQueueWorker"
description: "runQueueWorker — Outpost API"
sidebar:
  order: 10
---

Public contract for **runQueueWorker**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import { runQueueWorker } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name               | Type                                     | Presence | Meaning                                                                                  |
| ------------------ | ---------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`          | `QueueWorkerOptions`                     | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.queue`    | `TaskQueue`                              | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.worker`   | `string`                                 | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.handlers` | `Readonly<Record<string, QueueHandler>>` | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.signal`   | `AbortSignal`                            | Required | Cooperative cancellation for this operation.                                             |
| `options.leaseMs`  | `number \| undefined`                    | Optional | Worker lease duration in milliseconds.                                                   |
| `options.pollMs`   | `number \| undefined`                    | Optional | See the linked contract and this family's rules for its interpretation.                  |

## Returns

`Promise<void>`

## Signature

```ts
export declare function runQueueWorker(
  options: QueueWorkerOptions,
): Promise<void>;
```

## Related contracts

- [QueueWorkerOptions](../queueworkeroptions/)
