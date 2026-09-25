---
title: "OpenTelemetryObserver"
description: "OpenTelemetryObserver — Outpost API"
sidebar:
  order: 10
---

Public contract for **OpenTelemetryObserver**. See the [observability guide](../../guide/agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { OpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
```

## Purpose and behavior

Observe progress, log execution and account for reported usage without changing task outcomes.

Observer failures are isolated. Token counts are not prices. The optional OpenTelemetry entry point loads its vendor API separately from core imports.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name      | Type                             | Presence | Meaning                                                                 |
| --------- | -------------------------------- | -------- | ----------------------------------------------------------------------- |
| `observe` | `(event: WorkflowEvent) => void` | Required | Notification callback; observer failures are isolated.                  |
| `close`   | `() => void`                     | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface OpenTelemetryObserver {
  observe(event: WorkflowEvent): void;
  close(): void;
}
```

## Related contracts

- [WorkflowEvent](../workflowevent/)
