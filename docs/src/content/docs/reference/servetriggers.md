---
title: "serveTriggers"
description: "serveTriggers — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { serveTriggers } from "@elie-laloum/outpost";
```

## Purpose and behavior

Start an HTTP server that verifies each POST with its route source and publishes the job selected by on() as trigger:&lt;path>:&lt;delivery>; redeliveries publish nothing new. It answers 202, 204, 400, 401, 404, 405, 413, 500 or 503, a source can replace 202 and 204, and it resolves once listening; invalid options or an unavailable port reject. The caller closes the server, then its queue.

[Complete example and detailed rules](../../guide/webhooks/).

## Parameters and properties

| Name               | Type                                                               | Presence | Meaning                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`          | `TriggerServerOptions`                                             | Required | Queue, routes, listening address, body limit and failure observer.                                                                                                              |
| `options.queue`    | `TaskQueue`                                                        | Required | Queue receiving the jobs; a rejected enqueue answers 503.                                                                                                                       |
| `options.routes`   | `readonly TriggerRoute[]`                                          | Required | At least one route with a unique path.                                                                                                                                          |
| `options.host`     | `string \| undefined`                                              | Optional | Listening address; defaults to 127.0.0.1. Expose the server through a TLS-terminating proxy.                                                                                    |
| `options.port`     | `number \| undefined`                                              | Optional | Listening port; 0 or omitted selects a free port reported in url.                                                                                                               |
| `options.maxBytes` | `number \| undefined`                                              | Optional | Request body limit in bytes; defaults to 1 MiB, at most 25 MiB. Larger bodies answer 413.                                                                                       |
| `options.onError`  | `((error: unknown, failure: TriggerFailure) => void) \| undefined` | Optional | Observes verification, routing and publication failures with the path and, after verification, the delivery; never receives secrets. Errors thrown by the callback are ignored. |

## Returns

`Promise<TriggerServer>`

## Signature

```ts
export declare function serveTriggers(
  options: TriggerServerOptions,
): Promise<TriggerServer>;
```

## Related contracts

- [TriggerServer](../triggerserver/)
- [TriggerServerOptions](../triggerserveroptions/)
