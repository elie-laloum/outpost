---
title: "ObservationHubOptions"
description: "ObservationHubOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationHubOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                      | Presence | Meaning                                                                                                               |
| ------------------- | ----------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `sinks`             | `readonly ObservationSink[] \| undefined` | Optional | Receivers attached to this root and inherited by every child.                                                         |
| `scope`             | `ObservationScope \| undefined`           | Optional | Initial correlation fields; child scopes override only explicitly supplied fields.                                    |
| `capacity`          | `number \| undefined`                     | Optional | Maximum waiting envelopes per asynchronous sink, default 1024; newest deliveries are dropped on overflow and counted. |
| `deliveryTimeoutMs` | `number \| undefined`                     | Optional | Maximum asynchronous delivery or receiver-flush wait, default 5000 ms; an expired receiver is disabled.               |
| `verbose`           | `boolean \| undefined`                    | Optional | Explicitly allow full model request/response events. Does not enable verbose journal retention by itself.             |

## Signature

```ts
export interface ObservationHubOptions {
  readonly sinks?: readonly ObservationSink[];
  readonly scope?: ObservationScope;
  readonly capacity?: number;
  readonly deliveryTimeoutMs?: number;
  readonly verbose?: boolean;
}
```

## Related contracts

- [ObservationScope](../observationscope/)
- [ObservationSink](../observationsink/)
