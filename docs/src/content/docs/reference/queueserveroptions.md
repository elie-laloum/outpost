---
title: "QueueServerOptions"
description: "QueueServerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueServerOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                                                                | Presence | Meaning                                                                                                                                                                                                                                              |
| ------- | ------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queue` | `TaskQueue`                                                         | Required | Queue served over HTTP; closing the server leaves it open.                                                                                                                                                                                           |
| `token` | `string \| (() => readonly string[] \| Promise<readonly string[]>)` | Required | Accepted bearer token of 32 to 512 non-whitespace characters, or a function returning the accepted tokens, called on every request. Return the old and new tokens together during a rotation; an empty list or a thrown error rejects every request. |
| `host`  | `string \| undefined`                                               | Optional | Bind address, default 127.0.0.1.                                                                                                                                                                                                                     |
| `port`  | `number \| undefined`                                               | Optional | TCP port, default 0: the system picks a free port, shown in url.                                                                                                                                                                                     |

## Signature

```ts
export interface QueueServerOptions {
  readonly queue: TaskQueue;
  readonly token:
    string | (() => readonly string[] | Promise<readonly string[]>);
  readonly host?: string;
  readonly port?: number;
}
```

## Related contracts

- [TaskQueue](../taskqueue/)
