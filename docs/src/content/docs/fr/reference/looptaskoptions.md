---
title: "LoopTaskOptions"
description: "LoopTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LoopTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                                   | Présence  | Rôle                                                                                                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxRounds` | `number`                                                                               | Requis    | Entier sûr strictement positif limitant les tours logiques, reprises comprises. Rejouer une phase interrompue conserve son tour mais consomme une tentative supplémentaire du workflow.                          |
| `attempt`   | `(context: LoopTaskContext, feedback: string \| undefined) => T \| Promise<T>`         | Requis    | Produit le résultat candidat depuis le contexte de phase et le feedback du refus précédent ; feedback vaut undefined au premier tour. Les résultats persistés doivent être du JSON sans perte ou undefined.      |
| `check`     | `(context: LoopTaskContext, result: T) => LoopCheckResult \| Promise<LoopCheckResult>` | Requis    | Accepte le candidat avec done: true ou demande un autre tour avec done: false et un feedback textuel. Peut appeler un agent relecteur ; déclarer son usage via le contexte. Une exception fait échouer la tâche. |
| `key`       | `string`                                                                               | Requis    | Clé stable du nœud utilisée par les dépendances, checkpoints et événements de boucle.                                                                                                                            |
| `cache`     | `TaskCacheOptions \| undefined`                                                        | Optionnel | Cache optionnel du résultat accepté de la boucle ; une correspondance saute tous les tours et n’enregistre aucun tour.                                                                                           |
| `after`     | `readonly Task<unknown>[] \| undefined`                                                | Optionnel | Dépendances devant réussir avant le premier tour ; leurs résultats sont accessibles via context.value.                                                                                                           |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                 | Optionnel | Prédicat évalué avant que la boucle démarre ou reprenne ; false ignore la tâche et ses dépendantes.                                                                                                              |
| `timeoutMs` | `number \| undefined`                                                                  | Optionnel | Délai coopératif pour une exécution de tour, essai et vérification compris ; renouvelé à la reprise d’une phase interrompue.                                                                                     |

## Signature

```ts
export interface LoopTaskOptions<T> extends Pick<
  TaskOptions<T>,
  "key" | "after" | "condition" | "timeoutMs" | "cache"
> {
  readonly maxRounds: number;
  readonly attempt: (
    context: LoopTaskContext,
    feedback: string | undefined,
  ) => T | Promise<T>;
  readonly check: (
    context: LoopTaskContext,
    result: T,
  ) => LoopCheckResult | Promise<LoopCheckResult>;
}
```

## Contrats associés

- [LoopCheckResult](../loopcheckresult/)
- [LoopTaskContext](../looptaskcontext/)
- [TaskOptions](../taskoptions/)
