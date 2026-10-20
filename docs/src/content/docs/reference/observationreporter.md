---
title: "ObservationReporter"
description: "ObservationReporter — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationReporter } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                  | Presence | Meaning                                                                                                                                                      |
| --------- | ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `event`   | `ObservationEvent & ReportPass`                       | Required | An observation event with optional pass number for the historical callable interface. For scoped delivery, pass the reporter directly as an ObservationSink. |
| `observe` | `(observation: Observation) => void \| Promise<void>` | Required | Receive one envelope; returned promises are serialized per sink and rejection is isolated from execution.                                                    |
| `flush`   | `(() => void \| Promise<void>) \| undefined`          | Optional | Drains the receiver’s own buffer; the hub calls it from flush() with its delivery timeout.                                                                   |

## Signature

```ts
export interface ObservationReporter extends ObservationSink {
  (event: ObservationEvent & ReportPass): void;
}
```

## Related contracts

- [ObservationEvent](../observationevent/)
- [ObservationSink](../observationsink/)
- [ReportPass](../support-reportpass/)
