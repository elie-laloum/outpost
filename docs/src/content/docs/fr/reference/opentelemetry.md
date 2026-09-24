---
title: "openTelemetry"
description: "openTelemetry — Outpost API"
sidebar:
  order: 10
---

Contrat public de **openTelemetry**. Consultez le [guide observabilité](../../agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [OpenTelemetryObserver](../opentelemetryobserver/)
- [OpenTelemetryOptions](../opentelemetryoptions/)
