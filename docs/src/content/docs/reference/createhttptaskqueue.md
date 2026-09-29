---
title: "createHttpTaskQueue"
description: "createHttpTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHttpTaskQueue } from "@elie-laloum/outpost";
```

## Purpose and behavior

Return a TaskQueue client that sends each operation to a serveTaskQueue() server with a bearer token, fixed or resolved before every request. A refused request rejects with Queue request rejected (&lt;status>) and redirects are not followed. The client holds no connection to close.

[Complete example and detailed rules](../../guide/job-queues/).

## Parameters and properties

| Name                | Type                                          | Presence | Meaning                                                                                                                                                                                       |
| ------------------- | --------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `QueueClientOptions`                          | Required | Server URL, bearer token and per-request timeout.                                                                                                                                             |
| `options.url`       | `string`                                      | Required | Base URL of a serveTaskQueue() server, http or https, without credentials, query or fragment; requests go to &lt;url>/queue.                                                                  |
| `options.token`     | `string \| (() => string \| Promise<string>)` | Required | Bearer token, or a function called before every request, lease renewals and completions included, so a rotated token applies at once. Each value must be 32 to 512 non-whitespace characters. |
| `options.timeoutMs` | `number \| undefined`                         | Optional | Time limit per HTTP request in milliseconds, default 10000, counted after the token is resolved.                                                                                              |

## Returns

`TaskQueue`

## Signature

```ts
export declare function createHttpTaskQueue(
  options: QueueClientOptions,
): TaskQueue;
```

## Related contracts

- [QueueClientOptions](../queueclientoptions/)
- [TaskQueue](../taskqueue/)
