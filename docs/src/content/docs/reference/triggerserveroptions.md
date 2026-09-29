---
title: "TriggerServerOptions"
description: "TriggerServerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerServerOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                                               | Presence | Meaning                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queue`    | `TaskQueue`                                                        | Required | Queue receiving the jobs; a rejected enqueue answers 503.                                                                                                                       |
| `routes`   | `readonly TriggerRoute[]`                                          | Required | At least one route with a unique path.                                                                                                                                          |
| `host`     | `string \| undefined`                                              | Optional | Listening address; defaults to 127.0.0.1. Expose the server through a TLS-terminating proxy.                                                                                    |
| `port`     | `number \| undefined`                                              | Optional | Listening port; 0 or omitted selects a free port reported in url.                                                                                                               |
| `maxBytes` | `number \| undefined`                                              | Optional | Request body limit in bytes; defaults to 1 MiB, at most 25 MiB. Larger bodies answer 413.                                                                                       |
| `onError`  | `((error: unknown, failure: TriggerFailure) => void) \| undefined` | Optional | Observes verification, routing and publication failures with the path and, after verification, the delivery; never receives secrets. Errors thrown by the callback are ignored. |

## Signature

```ts
export interface TriggerServerOptions {
  readonly queue: TaskQueue;
  readonly routes: readonly TriggerRoute[];
  /** Defaults to 127.0.0.1; expose through a TLS-terminating proxy. */
  readonly host?: string;
  readonly port?: number;
  /** Request body limit; defaults to 1 MiB, at most 25 MiB. */
  readonly maxBytes?: number;
  /** Observes rejected or failed requests; never receives secrets. */
  readonly onError?: (error: unknown, failure: TriggerFailure) => void;
}
```

## Related contracts

- [TaskQueue](../taskqueue/)
- [TriggerFailure](../triggerfailure/)
- [TriggerRoute](../triggerroute/)
