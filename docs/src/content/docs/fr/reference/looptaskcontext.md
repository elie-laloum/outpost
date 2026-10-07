---
title: "LoopTaskContext"
description: "LoopTaskContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LoopTaskContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                                                     | Présence  | Rôle                                                                                                                                                                                                                           |
| ----------------- | -------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `round`           | `number`                                                 | Requis    | Numéro du tour logique à partir de un, stable lors du rejeu d’une phase interrompue.                                                                                                                                           |
| `phase`           | `"attempt" \| "check"`                                   | Requis    | Phase du callback courant : attempt produit un candidat ; check le vérifie.                                                                                                                                                    |
| `prices`          | `ModelPriceTable \| undefined`                           | Optionnel | Table de prix du workflow, transmise par les helpers de tâches d’agent. Les dispatchs personnalisés doivent la passer explicitement pour collecter les compteurs par modèle.                                                   |
| `quota`           | `WorkflowQuotaPause \| undefined`                        | Optionnel | Pause sur quota reprise par cette tentative, avec la conversation capturée et la branche conservée lorsqu’elles sont connues ; présente seulement lors de la première tentative après la pause et jamais persistée séparément. |
| `interaction`     | `TaskInteractionContext \| undefined`                    | Optionnel | État durable et opérations de suspension, fournis uniquement aux tâches déclarant une interaction.                                                                                                                             |
| `idempotencyKey`  | `string`                                                 | Requis    | Clé d’effet liée à l’exécution, la tâche, le tour logique et la phase ; stable lors du rejeu de cette phase. La déduplication externe reste à la charge de l’appelant.                                                         |
| `observation`     | `ObservationHub \| undefined`                            | Optionnel | Hub de la tâche avec exécution du workflow, clé et tentative ; le transmettre aux opérations imbriquées personnalisées comme speculate.                                                                                        |
| `signal`          | `AbortSignal`                                            | Requis    | Annulé quand le workflow s’arrête ou que le timeoutMs de ce tour expire.                                                                                                                                                       |
| `attempt`         | `number`                                                 | Requis    | Numéro de tentative cumulé de cette boucle, incrémenté pour les nouveaux tours et phases rejouées. Les deux callbacks d’un tour ininterrompu le partagent.                                                                     |
| `executionId`     | `string`                                                 | Requis    | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                                                                                                                                             |
| `reportUsage`     | `(usage: Usage) => void`                                 | Requis    | Ajoute synchroniquement l’usage de cette phase au budget du workflow, y compris les appels modèle échoués. L’usage n’est pas déduit des résultats arbitraires des callbacks.                                                   |
| `reportUsageOnce` | `((receipt: string, usage: Usage) => void) \| undefined` | Optionnel | Déduplique un reçu durable d’usage dans cette tâche. Utiliser un reçu par opération facturée distincte ; un appel payant rejoué exige un nouveau reçu.                                                                         |
| `checkpoint`      | `(() => Promise<void>) \| undefined`                     | Optionnel | Enregistre immédiatement l’état du workflow ; sans effet sans checkpoint.                                                                                                                                                      |
| `value`           | `<T>(dependency: Task<T>) => T`                          | Requis    | Lit la sortie terminée d’une tâche figurant dans les dépendances déclarées de cette tâche.                                                                                                                                     |

## Signature

```ts
export interface LoopTaskContext extends TaskContext {
  readonly round: number;
  readonly phase: "attempt" | "check";
}
```

## Contrats associés

- [TaskContext](../taskcontext/)
