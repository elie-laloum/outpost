---
title: "openTelemetry"
description: "openTelemetry — Outpost API"
sidebar:
  order: 10
---

Public contract for **openTelemetry**. See the [observability guide](../../guide/agents/observability/) for behavior, defaults and examples.

## Import

```ts
import { openTelemetry } from "@elie-laloum/outpost/opentelemetry";
```

## Purpose and behavior

Observe progress, log execution and account for reported usage without changing task outcomes.

Observer failures are isolated. Token counts are not prices. The optional OpenTelemetry entry point loads its vendor API separately from core imports.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name              | Type                                      | Presence | Meaning                                                                                  |
| ----------------- | ----------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`         | `OpenTelemetryOptions`                    | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.tracer`  | `Tracer`                                  | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.meter`   | `Meter`                                   | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.onError` | `((error: unknown) => void) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.                  |

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
