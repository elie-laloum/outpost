---
title: "OpenTelemetryOptions"
description: "OpenTelemetryOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **OpenTelemetryOptions**. Consultez le [guide observabilité](../../agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

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
