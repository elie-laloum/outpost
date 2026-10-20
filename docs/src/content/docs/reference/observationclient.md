---
title: "ObservationClient"
description: "ObservationClient — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationClient } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                                                                          | Presence | Meaning                                                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flush`                 | `() => Promise<void>`                                                                                         | Required | Flush in-memory delivery and active tracking sessions without closing them. Delivery remains bounded; failures and dropped events remain observable.                                                                                               |
| `close`                 | `() => Promise<void>`                                                                                         | Required | Prevent new sessions, wait for active sessions owned by this client or its children, then flush and close in-memory delivery. Idempotent. Does not cancel execution or close borrowed sinks, transport or telemetry SDKs. Readers remain usable.   |
| `readRun`               | `(id: string, options?: ObservationReadOptions) => Promise<RunSnapshot \| undefined>`                         | Required | Read the snapshot for id with optional signal and maxBytes; returns undefined when absent. Requires the configured transport. Expired running snapshots are reported abandoned without modifying storage.                                          |
| `watchRun`              | `(id: string, options?: ObservationWatchOptions) => AsyncIterable<RunEvent>`                                  | Required | Follow persisted events for id after options.from (default 0), polling until settled or expired. Supports signal, pollMs and maxBytes. Cancellation stops reading only. The record must exist; missing events and invalid cursors fail explicitly. |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                                         | Required | Await close(): stop accepting new executions, wait for active tracking sessions and flush delivery. Does not cancel executions or close borrowed sinks and transport.                                                                              |
| `redacting`             | `boolean`                                                                                                     | Required | True when this scope has any redaction rules, including inherited ones. Conversation capture uses it to refuse unsupported binary filtering only when enabled.                                                                                     |
| `scope`                 | `ObservationScope`                                                                                            | Required | Immutable correlation fields inherited by emissions from this hub.                                                                                                                                                                                 |
| `errors`                | `readonly unknown[]`                                                                                          | Required | Shared bounded collection of sink, serialization, overflow and timeout errors; retains the first 100 failures independently of execution.                                                                                                          |
| `dropped`               | `number`                                                                                                      | Required | Shared count of delivery losses across sinks, including overflow and disabled receivers.                                                                                                                                                           |
| `verbose`               | `boolean`                                                                                                     | Required | Whether producers may emit full model request and response payloads; journal retention is configured separately.                                                                                                                                   |
| `redact`                | `<T>(value: T) => T`                                                                                          | Required | Copy a structured value and apply this scope’s masking rules without mutating the original. Used by transcript storage before serializing records.                                                                                                 |
| `emit`                  | `(source: ObservationSource, event: ObservationEvent) => void`                                                | Required | Stamps an event with seq, timestamp, source and this hub’s scope, then delivers a copy to inherited and local sinks. Does nothing after close(); sink failures go to errors, never thrown.                                                         |
| `child`                 | `(scope: ObservationScope, sinks?: readonly ObservationSink[], redact?: readonly RegExp[]) => ObservationHub` | Required | Create a child scope inheriting sinks and redaction rules; optional additional sinks and regular expressions apply before all inherited and local receivers. Closing the child flushes its deliveries without closing the parent.                  |

## Signature

```ts
export interface ObservationClient extends ObservationHub {
  flush(): Promise<void>;
  close(): Promise<void>;
  readRun(
    id: string,
    options?: ObservationReadOptions,
  ): Promise<RunSnapshot | undefined>;
  watchRun(
    id: string,
    options?: ObservationWatchOptions,
  ): AsyncIterable<RunEvent>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Related contracts

- [ObservationHub](../observationhub/)
- [ObservationReadOptions](../observationreadoptions/)
- [ObservationWatchOptions](../observationwatchoptions/)
- [RunEvent](../runevent/)
- [RunSnapshot](../runsnapshot/)
