---
title: "Observation"
description: "Observation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Observation } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                | Presence | Meaning                                                                                                              |
| -------- | ------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `seq`    | `number`            | Required | Strictly increasing sequence shared by a root hub and all its scoped children; gaps may indicate dropped deliveries. |
| `at`     | `string`            | Required | ISO timestamp assigned when Outpost emits the event, not an upstream server timestamp.                               |
| `source` | `ObservationSource` | Required | Outpost subsystem producing the event.                                                                               |
| `scope`  | `ObservationScope`  | Required | Workflow, task, attempt, dispatch, pass and candidate fields known at emission.                                      |
| `event`  | `ObservationEvent`  | Required | Typed payload; narrow its kind before accessing variant-specific fields.                                             |

## Signature

```ts
export interface Observation {
  readonly seq: number;
  readonly at: string;
  readonly source: ObservationSource;
  readonly scope: ObservationScope;
  readonly event: ObservationEvent;
}
```

## Related contracts

- [ObservationEvent](../observationevent/)
- [ObservationScope](../observationscope/)
- [ObservationSource](../observationsource/)
