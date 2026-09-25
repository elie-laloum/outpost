---
title: "httpTaskQueue"
description: "httpTaskQueue — Outpost API"
sidebar:
  order: 10
---

Public contract for **httpTaskQueue**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import { httpTaskQueue } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name                | Type                  | Presence | Meaning                                                                                  |
| ------------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`           | `QueueClientOptions`  | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.url`       | `string`              | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.token`     | `string`              | Required | Explicit transport credential; never place it in a URL.                                  |
| `options.timeoutMs` | `number \| undefined` | Optional | Time limit in milliseconds for the owning operation.                                     |

## Returns

`TaskQueue`

## Signature

```ts
export declare function httpTaskQueue(options: QueueClientOptions): TaskQueue;
```

## Related contracts

- [QueueClientOptions](../queueclientoptions/)
- [TaskQueue](../taskqueue/)
