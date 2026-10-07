---
title: "ObservationHub"
description: "ObservationHub — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationHub } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                                                                          | Presence | Meaning                                                                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `redacting` | `boolean`                                                                                                     | Required | True when this scope has any redaction rules, including inherited ones. Conversation capture uses it to refuse unsupported binary filtering only when enabled.                                                                    |
| `scope`     | `ObservationScope`                                                                                            | Required | Immutable correlation fields inherited by emissions from this hub.                                                                                                                                                                |
| `errors`    | `readonly unknown[]`                                                                                          | Required | Shared bounded collection of sink, serialization, overflow and timeout errors; retains the first 100 failures independently of execution.                                                                                         |
| `dropped`   | `number`                                                                                                      | Required | Shared count of delivery losses across sinks, including overflow and disabled receivers.                                                                                                                                          |
| `verbose`   | `boolean`                                                                                                     | Required | Whether producers may emit full model request and response payloads; journal retention is configured separately.                                                                                                                  |
| `redact`    | `<T>(value: T) => T`                                                                                          | Required | Copy a structured value and apply this scope’s masking rules without mutating the original. Used by transcript storage before serializing records.                                                                                |
| `emit`      | `(source: ObservationSource, event: ObservationEvent) => void`                                                | Required | Stamps an event with seq, timestamp, source and this hub’s scope, then delivers a copy to inherited and local sinks. Does nothing after close(); sink failures go to errors, never thrown.                                        |
| `child`     | `(scope: ObservationScope, sinks?: readonly ObservationSink[], redact?: readonly RegExp[]) => ObservationHub` | Required | Create a child scope inheriting sinks and redaction rules; optional additional sinks and regular expressions apply before all inherited and local receivers. Closing the child flushes its deliveries without closing the parent. |
| `flush`     | `() => Promise<void>`                                                                                         | Required | Drain the current delivery snapshot and flush registered sinks with bounded waits; later emissions belong to a later snapshot.                                                                                                    |
| `close`     | `() => Promise<void>`                                                                                         | Required | Stop emissions from this child and its descendants, drain its delivery snapshot and detach its own sinks without closing caller-owned parent sinks.                                                                               |

## Signature

```ts
export interface ObservationHub {
  readonly redacting: boolean;
  readonly scope: ObservationScope;
  readonly errors: readonly unknown[];
  readonly dropped: number;
  readonly verbose: boolean;
  redact<T>(value: T): T;
  emit(source: ObservationSource, event: ObservationEvent): void;
  child(
    scope: ObservationScope,
    sinks?: readonly ObservationSink[],
    redact?: readonly RegExp[],
  ): ObservationHub;
  flush(): Promise<void>;
  close(): Promise<void>;
}
```

## Related contracts

- [ObservationEvent](../observationevent/)
- [ObservationScope](../observationscope/)
- [ObservationSink](../observationsink/)
- [ObservationSource](../observationsource/)
