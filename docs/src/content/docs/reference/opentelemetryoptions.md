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

| Name      | Type                                      | Presence | Meaning                                                                                                                                                                    |
| --------- | ----------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tracer`  | `Tracer`                                  | Required | OpenTelemetry tracer used to create execution spans.                                                                                                                       |
| `meter`   | `Meter`                                   | Required | OpenTelemetry meter for Outpost execution counters, duration histograms and token counters (outpost.workflow._, outpost.task._, outpost.dispatch.*, outpost.agent.tokens). |
| `onError` | `((error: unknown) => void) \| undefined` | Optional | Receives errors thrown by the tracer or meter while recording workflows and dispatches; they never change a run’s outcome. Errors thrown by onError are ignored.           |

## Signature

```ts
import type { Meter, Tracer } from "@opentelemetry/api";

export interface OpenTelemetryOptions {
  readonly tracer: Tracer;
  readonly meter: Meter;
  readonly onError?: (error: unknown) => void;
}
```
