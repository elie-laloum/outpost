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

Create a TaskQueue client for the supplied HTTP endpoint and bearer token. Each request is subject to timeoutMs; this client transports queue operations and does not execute handlers locally.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name                | Type                  | Presence | Meaning                                                 |
| ------------------- | --------------------- | -------- | ------------------------------------------------------- |
| `options`           | `QueueClientOptions`  | Required | Queue endpoint URL, bearer token and request timeout.   |
| `options.url`       | `string`              | Required | HTTP base URL of the task queue server.                 |
| `options.token`     | `string`              | Required | Explicit transport credential; never place it in a URL. |
| `options.timeoutMs` | `number \| undefined` | Optional | Time limit in milliseconds for each HTTP queue request. |

## Returns

`TaskQueue`

## Signature

```ts
export declare function httpTaskQueue(options: QueueClientOptions): TaskQueue;
```

## Related contracts

- [QueueClientOptions](../queueclientoptions/)
- [TaskQueue](../taskqueue/)
