---
title: "OpenTelemetryOptions"
description: "OpenTelemetryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { OpenTelemetryOptions } from "@elie-laloum/outpost/opentelemetry";
```

## Parameters and properties

| Name      | Type                                      | Presence | Meaning                                                          |
| --------- | ----------------------------------------- | -------- | ---------------------------------------------------------------- |
| `tracer`  | `Tracer`                                  | Required | OpenTelemetry tracer used to create execution spans.             |
| `meter`   | `Meter`                                   | Required | OpenTelemetry meter used to record execution and token metrics.  |
| `onError` | `((error: unknown) => void) \| undefined` | Optional | Callback receiving isolated telemetry-export or observer errors. |

## Signature

```ts
import type { Meter, Tracer } from "@opentelemetry/api";

export interface OpenTelemetryOptions {
  readonly tracer: Tracer;
  readonly meter: Meter;
  readonly onError?: (error: unknown) => void;
}
```
