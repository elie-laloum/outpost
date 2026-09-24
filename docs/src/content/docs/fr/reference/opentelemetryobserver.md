---
title: "OpenTelemetryObserver"
description: "OpenTelemetryObserver — Outpost API"
sidebar:
  order: 10
---

Contrat public de **OpenTelemetryObserver**. Consultez le [guide observabilité](../../agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [WorkflowEvent](../workflowevent/)
