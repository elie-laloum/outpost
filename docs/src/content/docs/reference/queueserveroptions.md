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

| Name    | Type                                                                | Presence | Meaning                                                                                                                                                                   |
| ------- | ------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queue` | `TaskQueue`                                                         | Required | Task queue used to enqueue, claim and persist job state.                                                                                                                  |
| `token` | `string \| (() => readonly string[] \| Promise<readonly string[]>)` | Required | Fixed bearer token or callback returning the currently accepted tokens on every request. Overlap old and new tokens during rotation; empty or failed sources deny access. |
| `host`  | `string \| undefined`                                               | Optional | HTTP bind address; defaults to loopback for local-only access.                                                                                                            |
| `port`  | `number \| undefined`                                               | Optional | TCP port for the queue HTTP server; zero lets the operating system choose an available port.                                                                              |

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
