---
title: "WorkflowJobStartOptions"
description: "WorkflowJobStartOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowJobStartOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | ----------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observation`      | `ObservationHub \| undefined`                   | Optionnel | Hub parent recevant les enveloppes de workflow, tâche, agent et opération ; les callbacks observe historiques reçoivent toujours WorkflowEvent.                                                                                                                                                                                              |
| `timeoutMs`        | `number \| undefined`                           | Optionnel | Délai en millisecondes de cet appel à start(), entier positif jusqu’à 2147483647, qui couvre l’acquisition du checkpoint, les conditions, les tentatives et les attentes de relance. À l’expiration, les tâches en cours sont annulées et le statut est failed avec une OutpostError de code timeout ; chaque appel reçoit un nouveau délai. |
| `redact`           | `readonly RegExp[] \| undefined`                | Optionnel | Règles appliquées avant chaque récepteur du workflow ou dispatch imbriqué et aux conversations capturées prises en charge. Héritées par les scopes d’observation enfants.                                                                                                                                                                    |
| `onQuota`          | `WorkflowQuotaPolicy \| undefined`              | Optionnel | Politique optionnelle qui met une tâche en pause sur une erreur de quota au lieu de la reprendre ou de la faire échouer ; exige un checkpoint. Les pauses sur quota sont relâchées par un start() ultérieur dès que la réinitialisation est atteignable dans maxWaitMs, ou lorsqu’elle est inconnue ou passée.                               |
| `decisionVerifier` | `WorkflowDecisionVerifier \| undefined`         | Optionnel | Vérificateur de confiance appelé pour chaque preuve soumise ; requis pour les gates signés. Un échec laisse toutes les décisions en attente inappliquées.                                                                                                                                                                                    |
| `concurrency`      | `number \| undefined`                           | Optionnel | Nombre maximal de tâches exécutées en même temps, 1 par défaut (les tâches s’exécutent dans l’ordre de la liste). Doit être un entier positif.                                                                                                                                                                                               |
| `budget`           | `WorkflowBudget \| undefined`                   | Optionnel | Limites de tentatives et de tokens partagées par toutes les tâches, usage restauré compris ; en atteindre une fait échouer l’exécution avec WorkflowBudgetExceeded.                                                                                                                                                                          |
| `stopOnError`      | `boolean \| undefined`                          | Optionnel | Vaut true par défaut : le premier échec interrompt l’exécution et annule les tâches en cours et en attente. Avec false, seules les tâches dépendantes de la tâche en échec sont ignorées et les tâches indépendantes continuent.                                                                                                             |
| `telemetry`        | `WorkflowTelemetry \| undefined`                | Optionnel | Adaptateur qui reçoit chaque WorkflowEvent avant observe, par exemple createOpenTelemetryObserver({ tracer, meter }). Ses erreurs vont dans observerErrors ; son cycle de vie vous appartient.                                                                                                                                               |
| `observe`          | `((event: WorkflowEvent) => void) \| undefined` | Optionnel | Reçoit chaque WorkflowEvent après telemetry ; les erreurs levées sont collectées dans observerErrors sans modifier l’exécution.                                                                                                                                                                                                              |

## Signature

```ts
export type WorkflowJobStartOptions = Omit<
  WorkflowOptions,
  "checkpoint" | "signal" | "decisions" | "answers"
>;
```

## Contrats associés

- [WorkflowOptions](../workflowoptions/)
