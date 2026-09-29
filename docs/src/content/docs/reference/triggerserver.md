---
title: "TriggerServer"
description: "TriggerServer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerServer } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                  | Presence | Meaning                                                                                 |
| ------- | --------------------- | -------- | --------------------------------------------------------------------------------------- |
| `url`   | `string`              | Required | Base URL of the listening server, such as http://127.0.0.1:8787.                        |
| `close` | `() => Promise<void>` | Required | Stop accepting connections and resolve once the server is closed; the queue stays open. |

## Signature

```ts
export interface TriggerServer {
  readonly url: string;
  close(): Promise<void>;
}
```
