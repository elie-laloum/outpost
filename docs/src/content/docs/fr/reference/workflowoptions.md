---
title: "WorkflowOptions"
description: "WorkflowOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                  |
| ------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `decisions`   | `readonly WorkflowDecision[] \| undefined`      | Optionnel | Décisions explicites pour les gates persistés en attente.                                                                                                                                                                                                                             |
| `checkpoint`  | `WorkflowCheckpointOptions \| undefined`        | Optionnel | Stockage durable de l’exécution et configuration de rejeu.                                                                                                                                                                                                                            |
| `signal`      | `AbortSignal \| undefined`                      | Optionnel | Annulation coopérative de cette opération.                                                                                                                                                                                                                                            |
| `concurrency` | `number \| undefined`                           | Optionnel | Nombre maximal de tâches de workflow exécutées simultanément.                                                                                                                                                                                                                         |
| `budget`      | `WorkflowBudget \| undefined`                   | Optionnel | Limites partagées de tentatives et d’usage observé.                                                                                                                                                                                                                                   |
| `stopOnError` | `boolean \| undefined`                          | Optionnel | Arrête l’admission de nouvelles tâches après un échec lorsque cette option est activée.                                                                                                                                                                                               |
| `telemetry`   | `WorkflowTelemetry \| undefined`                | Optionnel | Adaptateur de télémétrie du workflow, par exemple openTelemetry({ tracer, meter }) ; reçoit les événements avant observe, avec exceptions isolées collectées dans observerErrors. Son cycle de vie appartient à l’appelant ; l’instrumentation des dispatchs se configure séparément. |
| `observe`     | `((event: WorkflowEvent) => void) \| undefined` | Optionnel | Callback personnalisé de cycle de vie et d’usage du workflow, appelé après telemetry de manière indépendante ; les erreurs levées sont collectées dans observerErrors. Les callbacks observe OpenTelemetry existants restent pris en charge.                                          |

## Signature

```ts
export interface WorkflowOptions {
  readonly decisions?: readonly WorkflowDecision[];
  readonly checkpoint?: WorkflowCheckpointOptions;
  readonly signal?: AbortSignal;
  readonly concurrency?: number;
  readonly budget?: WorkflowBudget;
  readonly stopOnError?: boolean;
  readonly telemetry?: WorkflowTelemetry;
  readonly observe?: (event: WorkflowEvent) => void;
}
```

## Contrats associés

- [WorkflowBudget](../workflowbudget/)
- [WorkflowCheckpointOptions](../workflowcheckpointoptions/)
- [WorkflowDecision](../workflowdecision/)
- [WorkflowEvent](../workflowevent/)
- [WorkflowTelemetry](../workflowtelemetry/)
