---
title: "DispatchTelemetrySession"
description: "DispatchTelemetrySession — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DispatchTelemetrySession } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                                          | Presence | Meaning                                                                       |
| -------- | --------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `finish` | `(outcome: DispatchTelemetryOutcome) => void` | Required | Finish this session with the settled dispatch outcome and known token totals. |

## Signature

```ts
export interface DispatchTelemetrySession {
  finish(outcome: DispatchTelemetryOutcome): void;
}
```

## Related contracts

- [DispatchTelemetryOutcome](../dispatchtelemetryoutcome/)
