---
title: "QueueClientOptions"
description: "QueueClientOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueClientOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                 |
| ----------- | --------------------- | -------- | ------------------------------------------------------- |
| `url`       | `string`              | Required | HTTP base URL of the task queue server.                 |
| `token`     | `string`              | Required | Explicit transport credential; never place it in a URL. |
| `timeoutMs` | `number \| undefined` | Optional | Time limit in milliseconds for each HTTP queue request. |

## Signature

```ts
export interface QueueClientOptions {
  readonly url: string;
  readonly token: string;
  readonly timeoutMs?: number;
}
```
