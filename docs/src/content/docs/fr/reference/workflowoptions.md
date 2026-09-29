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

| Nom                | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | ----------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onQuota`          | `WorkflowQuotaPolicy \| undefined`              | Optionnel | Politique optionnelle qui met une tâche en pause sur une erreur de quota au lieu de la reprendre ou de la faire échouer ; exige un checkpoint. Les pauses sur quota sont relâchées par un start() ultérieur dès que la réinitialisation est atteignable dans maxWaitMs, ou lorsqu’elle est inconnue ou passée.                               |
| `answers`          | `readonly WorkflowAnswer[] \| undefined`        | Optionnel | Réponses aux demandes de saisie en attente, liste non vide ; requiert un checkpoint. Toutes sont validées avant d’en appliquer une, et une réponse invalide, périmée ou en double fait rejeter start().                                                                                                                                      |
| `timeoutMs`        | `number \| undefined`                           | Optionnel | Délai en millisecondes de cet appel à start(), entier positif jusqu’à 2147483647, qui couvre l’acquisition du checkpoint, les conditions, les tentatives et les attentes de relance. À l’expiration, les tâches en cours sont annulées et le statut est failed avec une OutpostError de code timeout ; chaque appel reçoit un nouveau délai. |
| `observation`      | `ObservationHub \| undefined`                   | Optionnel | Hub parent recevant les enveloppes de workflow, tâche, agent et opération ; les callbacks observe historiques reçoivent toujours WorkflowEvent.                                                                                                                                                                                              |
| `decisionVerifier` | `WorkflowDecisionVerifier \| undefined`         | Optionnel | Vérificateur de confiance appelé pour chaque preuve soumise ; requis pour les gates signés. Un échec laisse toutes les décisions en attente inappliquées.                                                                                                                                                                                    |
| `decisions`        | `readonly WorkflowDecision[] \| undefined`      | Optionnel | Décisions explicites pour les gates persistés en attente.                                                                                                                                                                                                                                                                                    |
| `checkpoint`       | `WorkflowCheckpointOptions \| undefined`        | Optionnel | Store, runId et version qui conservent les états, sorties et usage des tâches entre les appels à start(). Requis pour les gates, les interactions, answers, decisions et onQuota.                                                                                                                                                            |
| `signal`           | `AbortSignal \| undefined`                      | Optionnel | Annule l’exécution : les tâches en cours voient context.signal annulé, les tâches en attente finissent cancelled et le statut est cancelled.                                                                                                                                                                                                 |
| `concurrency`      | `number \| undefined`                           | Optionnel | Nombre maximal de tâches exécutées en même temps, 1 par défaut (les tâches s’exécutent dans l’ordre de la liste). Doit être un entier positif.                                                                                                                                                                                               |
| `budget`           | `WorkflowBudget \| undefined`                   | Optionnel | Limites de tentatives et de tokens partagées par toutes les tâches, usage restauré compris ; en atteindre une fait échouer l’exécution avec WorkflowBudgetExceeded.                                                                                                                                                                          |
| `stopOnError`      | `boolean \| undefined`                          | Optionnel | Vaut true par défaut : le premier échec interrompt l’exécution et annule les tâches en cours et en attente. Avec false, seules les tâches dépendantes de la tâche en échec sont ignorées et les tâches indépendantes continuent.                                                                                                             |
| `telemetry`        | `WorkflowTelemetry \| undefined`                | Optionnel | Adaptateur qui reçoit chaque WorkflowEvent avant observe, par exemple createOpenTelemetryObserver({ tracer, meter }). Ses erreurs vont dans observerErrors ; son cycle de vie vous appartient.                                                                                                                                               |
| `observe`          | `((event: WorkflowEvent) => void) \| undefined` | Optionnel | Reçoit chaque WorkflowEvent après telemetry ; les erreurs levées sont collectées dans observerErrors sans modifier l’exécution.                                                                                                                                                                                                              |

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
