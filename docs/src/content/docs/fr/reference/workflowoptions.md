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

| Nom                | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ----------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onQuota`          | `WorkflowQuotaPolicy \| undefined`              | Optionnel | Politique optionnelle qui met une tâche en pause sur une erreur de quota au lieu de la reprendre ou de la faire échouer ; exige un checkpoint. Les pauses sur quota sont relâchées par un start() ultérieur dès que la réinitialisation est atteignable dans maxWaitMs, ou lorsqu’elle est inconnue ou passée.                                           |
| `answers`          | `readonly WorkflowAnswer[] \| undefined`        | Optionnel | Réponses aux demandes en attente ; toutes sont validées avant application et persistées avant ordonnancement.                                                                                                                                                                                                                                            |
| `timeoutMs`        | `number \| undefined`                           | Optionnel | Délai entier positif en millisecondes pour cet appel à start(), jusqu’à 2147483647. Inclut acquisition du checkpoint, conditions, tentatives et attentes de reprise. Son expiration annule coopérativement les tâches et fait échouer le workflow avec une OutpostError timeout ; le nettoyage est attendu. Un appel de reprise reçoit un nouveau délai. |
| `observation`      | `ObservationHub \| undefined`                   | Optionnel | Hub parent recevant les enveloppes de workflow, tâche, agent et opération ; les callbacks observe historiques reçoivent toujours WorkflowEvent.                                                                                                                                                                                                          |
| `decisionVerifier` | `WorkflowDecisionVerifier \| undefined`         | Optionnel | Vérificateur de confiance appelé pour chaque preuve soumise ; requis pour les gates signés. Un échec laisse toutes les décisions en attente inappliquées.                                                                                                                                                                                                |
| `decisions`        | `readonly WorkflowDecision[] \| undefined`      | Optionnel | Décisions explicites pour les gates persistés en attente.                                                                                                                                                                                                                                                                                                |
| `checkpoint`       | `WorkflowCheckpointOptions \| undefined`        | Optionnel | Stockage durable de l’exécution et configuration de rejeu.                                                                                                                                                                                                                                                                                               |
| `signal`           | `AbortSignal \| undefined`                      | Optionnel | Annulation coopérative de cette opération.                                                                                                                                                                                                                                                                                                               |
| `concurrency`      | `number \| undefined`                           | Optionnel | Nombre maximal de tâches de workflow exécutées simultanément.                                                                                                                                                                                                                                                                                            |
| `budget`           | `WorkflowBudget \| undefined`                   | Optionnel | Limites partagées de tentatives et d’usage observé.                                                                                                                                                                                                                                                                                                      |
| `stopOnError`      | `boolean \| undefined`                          | Optionnel | Arrête l’admission de nouvelles tâches après un échec lorsque cette option est activée.                                                                                                                                                                                                                                                                  |
| `telemetry`        | `WorkflowTelemetry \| undefined`                | Optionnel | Adaptateur de télémétrie du workflow, par exemple openTelemetry({ tracer, meter }) ; reçoit les événements avant observe, avec exceptions isolées collectées dans observerErrors. Son cycle de vie appartient à l’appelant ; l’instrumentation des dispatchs se configure séparément.                                                                    |
| `observe`          | `((event: WorkflowEvent) => void) \| undefined` | Optionnel | Callback personnalisé de cycle de vie et d’usage du workflow, appelé après telemetry de manière indépendante ; les erreurs levées sont collectées dans observerErrors. Les callbacks observe OpenTelemetry existants restent pris en charge.                                                                                                             |

## Signature

```ts
export interface WorkflowOptions {
  readonly onQuota?: WorkflowQuotaPolicy;
  readonly answers?: readonly WorkflowAnswer[];
  readonly timeoutMs?: number;
  readonly observation?: ObservationHub;
  readonly decisionVerifier?: WorkflowDecisionVerifier;
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

- [ObservationHub](../observationhub/)
- [WorkflowAnswer](../workflowanswer/)
- [WorkflowBudget](../workflowbudget/)
- [WorkflowCheckpointOptions](../workflowcheckpointoptions/)
- [WorkflowDecision](../workflowdecision/)
- [WorkflowDecisionVerifier](../workflowdecisionverifier/)
- [WorkflowEvent](../workflowevent/)
- [WorkflowQuotaPolicy](../workflowquotapolicy/)
- [WorkflowTelemetry](../workflowtelemetry/)
