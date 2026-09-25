---
title: "openTelemetry"
description: "openTelemetry — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { openTelemetry } from "@elie-laloum/outpost/opentelemetry";
```

## Purpose and behavior

Create an observer backed by the supplied OpenTelemetry tracer and meter. It translates Outpost observations into spans and metrics while isolating telemetry errors through onError; close finishes outstanding spans. Only this entry point imports the optional telemetry API.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name              | Type                                      | Presence | Meaning                                                           |
| ----------------- | ----------------------------------------- | -------- | ----------------------------------------------------------------- |
| `options`         | `OpenTelemetryOptions`                    | Required | Tracer, meter and isolated error callback for workflow telemetry. |
| `options.tracer`  | `Tracer`                                  | Required | OpenTelemetry tracer used to create execution spans.              |
| `options.meter`   | `Meter`                                   | Required | OpenTelemetry meter used to record execution and token metrics.   |
| `options.onError` | `((error: unknown) => void) \| undefined` | Optional | Callback receiving isolated telemetry-export or observer errors.  |

## Returns

`OpenTelemetryObserver`

## Signature

```ts
export declare function openTelemetry(
  options: OpenTelemetryOptions,
): OpenTelemetryObserver;
```

## Related contracts

- [OpenTelemetryObserver](../opentelemetryobserver/)
- [OpenTelemetryOptions](../opentelemetryoptions/)
