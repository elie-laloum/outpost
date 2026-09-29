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

Serve a caller-owned TaskQueue over HTTP at POST /queue, authenticated by bearer tokens. Listens on 127.0.0.1 and a port chosen by the system by default, without TLS. Rejects a fixed token that is not 32 to 512 non-whitespace characters.

[Complete example and detailed rules](../../guide/job-queues/).

## Parameters and properties

| Name            | Type                                                                | Presence | Meaning                                                                                                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`       | `QueueServerOptions`                                                | Required | Queue to serve, accepted bearer tokens, and bind host and port.                                                                                                                                                                                      |
| `options.queue` | `TaskQueue`                                                         | Required | Queue served over HTTP; closing the server leaves it open.                                                                                                                                                                                           |
| `options.token` | `string \| (() => readonly string[] \| Promise<readonly string[]>)` | Required | Accepted bearer token of 32 to 512 non-whitespace characters, or a function returning the accepted tokens, called on every request. Return the old and new tokens together during a rotation; an empty list or a thrown error rejects every request. |
| `options.host`  | `string \| undefined`                                               | Optional | Bind address, default 127.0.0.1.                                                                                                                                                                                                                     |
| `options.port`  | `number \| undefined`                                               | Optional | TCP port, default 0: the system picks a free port, shown in url.                                                                                                                                                                                     |

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
