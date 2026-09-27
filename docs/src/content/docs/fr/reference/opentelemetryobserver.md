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

| Nom             | Type                             | Présence | Rôle                                                                                                                                                                                                |
| --------------- | -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sink`          | `ObservationSink`                | Requis   | Récepteur unifié du hub produisant des spans liés de workflow, tâche, dispatch et opération ainsi que les métriques existantes ; évite de brancher simultanément cette même instance par telemetry. |
| `close`         | `() => void`                     | Requis   | Termine les spans d’exécution encore ouverts appartenant à cet observateur.                                                                                                                         |
| `startDispatch` | `() => DispatchTelemetrySession` | Requis   | Ouvre une session indépendante pour un appel public de dispatch, avant validation.                                                                                                                  |
| `observe`       | `(event: WorkflowEvent) => void` | Requis   | Convertit un événement de workflow en spans et métriques de télémétrie.                                                                                                                             |

## Signature

```ts
export interface OpenTelemetryObserver
  extends DispatchTelemetry, WorkflowTelemetry {
  readonly sink: ObservationSink;
  close(): void;
}
```

## Contrats associés

- [DispatchTelemetry](../dispatchtelemetry/)
- [WorkflowTelemetry](../workflowtelemetry/)
