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

| Name        | Type                                          | Presence | Meaning                                                                                                                                                                                       |
| ----------- | --------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`       | `string`                                      | Required | Base URL of a serveTaskQueue() server, http or https, without credentials, query or fragment; requests go to &lt;url>/queue.                                                                  |
| `token`     | `string \| (() => string \| Promise<string>)` | Required | Bearer token, or a function called before every request, lease renewals and completions included, so a rotated token applies at once. Each value must be 32 to 512 non-whitespace characters. |
| `timeoutMs` | `number \| undefined`                         | Optional | Time limit per HTTP request in milliseconds, default 10000, counted after the token is resolved.                                                                                              |

## Signature

```ts
export interface QueueClientOptions {
  readonly url: string;
  readonly token: string | (() => string | Promise<string>);
  readonly timeoutMs?: number;
}
```
