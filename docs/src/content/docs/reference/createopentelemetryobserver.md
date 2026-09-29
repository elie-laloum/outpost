---
title: "createOpenTelemetryObserver"
description: "createOpenTelemetryObserver — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createOpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
```

## Purpose and behavior

Create OpenTelemetry instrumentation from your tracer and meter. Attach its sink to the hub you pass as observation for parented workflow, task, dispatch and operation spans, or pass the observer as telemetry to workflow.start() or dispatch(). Instrumentation errors go to onError; close() ends open spans without flushing or shutting down the SDK.

[Complete example and detailed rules](../../guide/observability/).

## Parameters and properties

| Name              | Type                                      | Presence | Meaning                                                                                                                                                                    |
| ----------------- | ----------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `OpenTelemetryOptions`                    | Required | Injected tracer, meter and isolated error callback for workflow and dispatch telemetry.                                                                                    |
| `options.tracer`  | `Tracer`                                  | Required | OpenTelemetry tracer used to create execution spans.                                                                                                                       |
| `options.meter`   | `Meter`                                   | Required | OpenTelemetry meter for Outpost execution counters, duration histograms and token counters (outpost.workflow._, outpost.task._, outpost.dispatch.*, outpost.agent.tokens). |
| `options.onError` | `((error: unknown) => void) \| undefined` | Optional | Receives errors thrown by the tracer or meter while recording workflows and dispatches; they never change a run’s outcome. Errors thrown by onError are ignored.           |

## Returns

`OpenTelemetryObserver`

## Signature

```ts
export declare function createOpenTelemetryObserver(
  options: OpenTelemetryOptions,
): OpenTelemetryObserver;
```

## Related contracts

- [OpenTelemetryObserver](../opentelemetryobserver/)
- [OpenTelemetryOptions](../opentelemetryoptions/)
