---
title: "httpTaskQueue"
description: "httpTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { httpTaskQueue } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a TaskQueue client with a fixed bearer token or a token source resolved per request. timeoutMs bounds HTTP exchange after token resolution; credential callbacks must return promptly. The client never executes handlers locally.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name                | Type                                          | Presence | Meaning                                                                                                              |
| ------------------- | --------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `options`           | `QueueClientOptions`                          | Required | Queue endpoint URL, bearer token and request timeout.                                                                |
| `options.url`       | `string`                                      | Required | HTTP base URL of the task queue server.                                                                              |
| `options.token`     | `string \| (() => string \| Promise<string>)` | Required | Fixed bearer token or callback resolving the current token for each request, including lease renewal and completion. |
| `options.timeoutMs` | `number \| undefined`                         | Optional | Time limit in milliseconds for each HTTP queue request.                                                              |

## Returns

`TaskQueue`

## Signature

```ts
export declare function httpTaskQueue(options: QueueClientOptions): TaskQueue;
```

## Related contracts

- [QueueClientOptions](../queueclientoptions/)
- [TaskQueue](../taskqueue/)
