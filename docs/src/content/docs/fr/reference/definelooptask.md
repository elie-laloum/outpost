---
title: "defineLoopTask"
description: "defineLoopTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineLoopTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit un nœud de workflow borné alternant essai et vérification. Les vérifications négatives fournissent le feedback du tour suivant ; une exception fait échouer la tâche. Le workflow persiste les phases, impute chaque exécution de tour au budget cumulé et renvoie le résultat accepté. Il ne possède ni sandbox ni conversations.

[Exemple complet et règles détaillées](../../guide/task-dependencies/).

## Paramètres et propriétés

| Nom                 | Type                                                                                   | Présence  | Rôle                                                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `LoopTaskOptions<T>`                                                                   | Requis    | Identité de tâche, dépendances, callback d’essai borné et vérification d’acceptation.                                                                                                                                         |
| `options.maxRounds` | `number`                                                                               | Requis    | Entier sûr strictement positif limitant les tours logiques, reprises comprises. Rejouer une phase interrompue conserve son tour mais consomme une tentative supplémentaire du workflow.                                       |
| `options.attempt`   | `(context: LoopTaskContext, feedback: string \| undefined) => T \| Promise<T>`         | Requis    | Produit le résultat candidat depuis le contexte de phase et le feedback du refus précédent ; feedback vaut undefined au premier tour. Les résultats persistés doivent être du JSON sans perte ou undefined.                   |
| `options.check`     | `(context: LoopTaskContext, result: T) => LoopCheckResult \| Promise<LoopCheckResult>` | Requis    | Accepte le candidat avec done: true ou demande un autre tour avec done: false et un feedback textuel. Peut appeler un agent relecteur ; déclarer son usage via le contexte. Une exception fait échouer la tâche.              |
| `options.key`       | `string`                                                                               | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                                                                                                                          |
| `options.cache`     | `TaskCacheOptions \| undefined`                                                        | Optionnel | Cache de résultat optionnel : une correspondance restaure la valeur JSON sans perte enregistrée, sans tentative, sans usage ni effet de bord. Refusé sur les gates, interactions et tâches renvoyant un résultat de dispatch. |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                                | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                                                                                                                     |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                 | Optionnel | Prédicat évalué avant la première tentative.                                                                                                                                                                                  |
| `options.timeoutMs` | `number \| undefined`                                                                  | Optionnel | Durée entière positive en millisecondes de chaque tentative, jusqu’à 2147483647 ; l’annulation est coopérative via context.signal.                                                                                            |

## Retour

`Task<T>`

## Signature

```ts
export declare function defineLoopTask<T>(options: LoopTaskOptions<T>): Task<T>;
```

## Contrats associés

- [LoopTaskOptions](../looptaskoptions/)
- [Task](../type-task/)
