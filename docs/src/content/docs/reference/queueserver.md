---
title: "QueueServer"
description: "QueueServer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueServer } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                  | Presence | Meaning                                                        |
| ------- | --------------------- | -------- | -------------------------------------------------------------- |
| `url`   | `string`              | Required | HTTP base URL of the task queue server.                        |
| `close` | `() => Promise<void>` | Required | Stop the HTTP listener without closing the caller-owned queue. |

## Signature

```ts
export interface QueueServer {
  readonly url: string;
  close(): Promise<void>;
}
```
