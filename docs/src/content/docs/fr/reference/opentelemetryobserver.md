---
title: "OpenTelemetryObserver"
description: "OpenTelemetryObserver — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { OpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
```

## Paramètres et propriétés

| Nom             | Type                             | Présence | Rôle                                                                               |
| --------------- | -------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `observe`       | `(event: WorkflowEvent) => void` | Requis   | Convertit un événement de workflow en spans et métriques de télémétrie.            |
| `close`         | `() => void`                     | Requis   | Termine les spans d’exécution encore ouverts appartenant à cet observateur.        |
| `startDispatch` | `() => DispatchTelemetrySession` | Requis   | Ouvre une session indépendante pour un appel public de dispatch, avant validation. |

## Signature

```ts
export interface OpenTelemetryObserver extends DispatchTelemetry {
  observe(event: WorkflowEvent): void;
  close(): void;
}
```

## Contrats associés

- [DispatchTelemetry](../dispatchtelemetry/)
- [WorkflowEvent](../workflowevent/)
