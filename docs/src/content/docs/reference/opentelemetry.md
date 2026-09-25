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

Create workflow observation and complete dispatch instrumentation from an injected tracer and meter. Pass the result as dispatch telemetry, or its observe method to a workflow. Errors are isolated through onError; close finishes outstanding spans without flushing or shutting down the SDK. Only this optional entry point loads OpenTelemetry.

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
