---
title: "createObservation"
description: "createObservation — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createObservation } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a reusable observation client with optional persistence and borrowed sinks. Dispatch and workflow engines open independent tracking sessions and close them on settlement; the client exposes readRun and watchRun for the same transport. Construction performs no storage writes or execution. Sessions use separate event sequences, and checkpoint resumes preserve persistent cursors. close() waits for active sessions without cancelling execution. Low-level hubs and standalone readers remain compatible.

[Complete example and detailed rules](../../guide/run-state/).

## Parameters and properties

| Name                        | Type                                      | Presence | Meaning                                                                                                                                                                                                                                    |
| --------------------------- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                   | `ObservationOptions \| undefined`         | Optional | Optional delivery, redaction, sink and persistence settings. With no transport, only in-memory observation is enabled. Sinks and transport are borrowed; no run is started by construction.                                                |
| `options.transporter`       | `Transport \| undefined`                  | Optional | Optional caller-owned transport for run snapshots and events under runs/&lt;id>/. Execution engines register and close tracking sessions; constructing a client or reading never creates records. Without it, readRun and watchRun refuse. |
| `options.heartbeatMs`       | `number \| undefined`                     | Optional | Tracking heartbeat interval in milliseconds, default 5000, a positive safe integer within the timer range. Applies only to recorded running executions.                                                                                    |
| `options.abandonAfterMs`    | `number \| undefined`                     | Optional | Heartbeat expiry delay in milliseconds, default 30000; must exceed heartbeatMs. Expiry reports suspected abandonment on read, never recovery authorization.                                                                                |
| `options.redact`            | `readonly RegExp[] \| undefined`          | Optional | Regular expressions applied recursively to event strings, keys and scope strings before delivery. Each rule replaces all matches; its lastIndex is preserved.                                                                              |
| `options.sinks`             | `readonly ObservationSink[] \| undefined` | Optional | Receivers attached to this root and inherited by every child.                                                                                                                                                                              |
| `options.scope`             | `ObservationScope \| undefined`           | Optional | Initial correlation fields; child scopes override only explicitly supplied fields.                                                                                                                                                         |
| `options.capacity`          | `number \| undefined`                     | Optional | Maximum events waiting per asynchronous sink, default 1024; on overflow the newest are dropped and counted. A value that is not a positive integer throws.                                                                                 |
| `options.deliveryTimeoutMs` | `number \| undefined`                     | Optional | Maximum wait for one asynchronous delivery or sink flush, default 5000; a sink that exceeds it is disabled for the hub’s lifetime. A value that is not a positive integer throws.                                                          |
| `options.verbose`           | `boolean \| undefined`                    | Optional | Explicitly allow full model request/response events. Does not enable verbose journal retention by itself.                                                                                                                                  |

## Returns

`ObservationClient`

## Signature

```ts
export declare function createObservation(
  options?: ObservationOptions,
): ObservationClient;
```

## Related contracts

- [ObservationClient](../observationclient/)
- [ObservationOptions](../observationoptions/)
