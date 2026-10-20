---
title: "ObservationOptions"
description: "ObservationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                      | Presence | Meaning                                                                                                                                                                                                                                    |
| ------------------- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `transporter`       | `Transport \| undefined`                  | Optional | Optional caller-owned transport for run snapshots and events under runs/&lt;id>/. Execution engines register and close tracking sessions; constructing a client or reading never creates records. Without it, readRun and watchRun refuse. |
| `heartbeatMs`       | `number \| undefined`                     | Optional | Tracking heartbeat interval in milliseconds, default 5000, a positive safe integer within the timer range. Applies only to recorded running executions.                                                                                    |
| `abandonAfterMs`    | `number \| undefined`                     | Optional | Heartbeat expiry delay in milliseconds, default 30000; must exceed heartbeatMs. Expiry reports suspected abandonment on read, never recovery authorization.                                                                                |
| `redact`            | `readonly RegExp[] \| undefined`          | Optional | Regular expressions applied recursively to event strings, keys and scope strings before delivery. Each rule replaces all matches; its lastIndex is preserved.                                                                              |
| `sinks`             | `readonly ObservationSink[] \| undefined` | Optional | Receivers attached to this root and inherited by every child.                                                                                                                                                                              |
| `scope`             | `ObservationScope \| undefined`           | Optional | Initial correlation fields; child scopes override only explicitly supplied fields.                                                                                                                                                         |
| `capacity`          | `number \| undefined`                     | Optional | Maximum events waiting per asynchronous sink, default 1024; on overflow the newest are dropped and counted. A value that is not a positive integer throws.                                                                                 |
| `deliveryTimeoutMs` | `number \| undefined`                     | Optional | Maximum wait for one asynchronous delivery or sink flush, default 5000; a sink that exceeds it is disabled for the hub’s lifetime. A value that is not a positive integer throws.                                                          |
| `verbose`           | `boolean \| undefined`                    | Optional | Explicitly allow full model request/response events. Does not enable verbose journal retention by itself.                                                                                                                                  |

## Signature

```ts
export interface ObservationOptions extends ObservationHubOptions {
  readonly transporter?: Transport;
  readonly heartbeatMs?: number;
  readonly abandonAfterMs?: number;
}
```

## Related contracts

- [ObservationHubOptions](../observationhuboptions/)
- [Transport](../transport/)
