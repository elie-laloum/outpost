---
title: "OpenTelemetryObserver"
description: "OpenTelemetryObserver — Outpost API"
sidebar:
  order: 10
---

Public contract for **OpenTelemetryObserver**. See the [observability guide](../../agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { OpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
```

## Signature

```ts
export interface OpenTelemetryObserver {
  observe(event: WorkflowEvent): void;
  close(): void;
}
```

## Related contracts

- [WorkflowEvent](../workflowevent/)
