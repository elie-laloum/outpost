---
title: "serveTaskQueue"
description: "serveTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { serveTaskQueue } from "@elie-laloum/outpost";
```

## Purpose and behavior

Expose a caller-owned task queue over HTTP with explicit bearer-token authentication. The server binds loopback by default and supplies no TLS. Closing the returned server stops listening without taking ownership of queue storage.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name            | Type                  | Presence | Meaning                                                                                      |
| --------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `options`       | `QueueServerOptions`  | Required | Caller-owned queue, bearer token and HTTP bind address/port.                                 |
| `options.queue` | `TaskQueue`           | Required | Task queue used to enqueue, claim and persist job state.                                     |
| `options.token` | `string`              | Required | Explicit transport credential; never place it in a URL.                                      |
| `options.host`  | `string \| undefined` | Optional | HTTP bind address; defaults to loopback for local-only access.                               |
| `options.port`  | `number \| undefined` | Optional | TCP port for the queue HTTP server; zero lets the operating system choose an available port. |

## Returns

`Promise<QueueServer>`

## Signature

```ts
export declare function serveTaskQueue(
  options: QueueServerOptions,
): Promise<QueueServer>;
```

## Related contracts

- [QueueServer](../queueserver/)
- [QueueServerOptions](../queueserveroptions/)
