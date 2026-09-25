---
title: "DispatchTelemetry"
description: "DispatchTelemetry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DispatchTelemetry } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                             | Presence | Meaning                                                                                    |
| --------------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `startDispatch` | `() => DispatchTelemetrySession` | Required | Start an independent session for one public dispatch invocation; called before validation. |

## Signature

```ts
export interface DispatchTelemetry {
  startDispatch(): DispatchTelemetrySession;
}
```

## Related contracts

- [DispatchTelemetrySession](../dispatchtelemetrysession/)
