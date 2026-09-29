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

| Nom             | Type                             | Présence | Rôle                                                                                                                                                                                                                                                                              |
| --------------- | -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sink`          | `ObservationSink`                | Requis   | Sink de hub qui transforme les observations en spans de workflow, de tâche, de tentative, de dispatch et d’opération reliés entre eux, avec les mêmes métriques. Ne passez pas aussi cet observateur comme telemetry à la même exécution : spans et métriques seraient dupliqués. |
| `close`         | `() => void`                     | Requis   | Termine tous les spans de workflow, de tâche, de tentative, de dispatch et d’opération encore ouverts comme annulés ou en échec. Il ne vide ni n’arrête le SDK.                                                                                                                   |
| `startDispatch` | `() => DispatchTelemetrySession` | Requis   | Ouvre une session indépendante pour un appel public de dispatch, avant validation.                                                                                                                                                                                                |
| `observe`       | `(event: WorkflowEvent) => void` | Requis   | Enregistre un événement de workflow sous forme de spans et de métriques ; workflow.start() l’appelle quand l’observateur est passé comme telemetry.                                                                                                                               |

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
