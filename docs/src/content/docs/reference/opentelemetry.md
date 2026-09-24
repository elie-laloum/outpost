---
title: "openTelemetry"
description: "openTelemetry — Outpost API"
sidebar:
  order: 10
---

Public contract for **openTelemetry**. See the [observability guide](../../agents/observability/) for behavior, defaults and examples.

## Import

```ts
import { openTelemetry } from "@elie-laloum/outpost/opentelemetry";
```

## Signature

```ts
export declare function openTelemetry(
  options: OpenTelemetryOptions,
): OpenTelemetryObserver;
```

## Related contracts

- [OpenTelemetryObserver](../opentelemetryobserver/)
- [OpenTelemetryOptions](../opentelemetryoptions/)
