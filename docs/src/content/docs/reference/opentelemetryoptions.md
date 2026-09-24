---
title: "OpenTelemetryOptions"
description: "OpenTelemetryOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **OpenTelemetryOptions**. See the [observability guide](../../agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { OpenTelemetryOptions } from "@elie-laloum/outpost/opentelemetry";
```

## Signature

```ts
import type { Meter, Tracer } from "@opentelemetry/api";

export interface OpenTelemetryOptions {
  readonly tracer: Tracer;
  readonly meter: Meter;
  readonly onError?: (error: unknown) => void;
}
```
