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

| Name    | Type                  | Presence | Meaning                                                                                            |
| ------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `url`   | `string`              | Required | Base URL of the listening server, such as http://127.0.0.1:8788, to pass to createHttpTaskQueue(). |
| `close` | `() => Promise<void>` | Required | Stop listening and close idle connections; the served queue stays open.                            |

## Signature

```ts
export interface QueueServer {
  readonly url: string;
  close(): Promise<void>;
}
```
