---
title: "OpenTelemetryOptions"
description: "OpenTelemetryOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **OpenTelemetryOptions**. See the [observability guide](../../guide/agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { OpenTelemetryOptions } from "@elie-laloum/outpost/opentelemetry";
```

## Purpose and behavior

Observe progress, log execution and account for reported usage without changing task outcomes.

Observer failures are isolated. Token counts are not prices. The optional OpenTelemetry entry point loads its vendor API separately from core imports.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name      | Type                                      | Presence | Meaning                                                                 |
| --------- | ----------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `tracer`  | `Tracer`                                  | Required | See the linked contract and this family's rules for its interpretation. |
| `meter`   | `Meter`                                   | Required | See the linked contract and this family's rules for its interpretation. |
| `onError` | `((error: unknown) => void) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
import type { Meter, Tracer } from "@opentelemetry/api";

export interface OpenTelemetryOptions {
  readonly tracer: Tracer;
  readonly meter: Meter;
  readonly onError?: (error: unknown) => void;
}
```
