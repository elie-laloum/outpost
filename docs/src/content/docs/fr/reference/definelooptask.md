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

Déclare une tâche qui exécute attempt puis check pendant au plus maxRounds tours, en transmettant le feedback de chaque check refusé à la tentative suivante. Chaque tour consomme une tentative du workflow et, avec un checkpoint, enregistre sa phase. La sortie est la valeur acceptée ; l’épuisement fait échouer la tâche avec LoopTaskExhausted et une exception d’un callback la fait échouer immédiatement.

[Exemple complet et règles détaillées](../../guide/verification-loops/).

## Paramètres et propriétés

| Nom                 | Type                                                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `LoopTaskOptions<T>`                                                                   | Requis    | Identité de tâche, dépendances, callback d’essai borné et vérification d’acceptation.                                                                                                                                                                                                                            |
| `options.maxRounds` | `number`                                                                               | Requis    | Entier sûr strictement positif limitant les tours logiques, reprises comprises. Rejouer une phase interrompue conserve son tour mais consomme une tentative supplémentaire du workflow.                                                                                                                          |
| `options.attempt`   | `(context: LoopTaskContext, feedback: string \| undefined) => T \| Promise<T>`         | Requis    | Produit le résultat candidat depuis le contexte de phase et le feedback du refus précédent ; feedback vaut undefined au premier tour. Les résultats persistés doivent être du JSON sans perte ou undefined.                                                                                                      |
| `options.check`     | `(context: LoopTaskContext, result: T) => LoopCheckResult \| Promise<LoopCheckResult>` | Requis    | Accepte le candidat avec done: true ou demande un autre tour avec done: false et un feedback textuel. Peut appeler un agent relecteur ; déclarer son usage via le contexte. Une exception fait échouer la tâche.                                                                                                 |
| `options.cache`     | `TaskCacheOptions \| undefined`                                                        | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `options.key`       | `string`                                                                               | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                                | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                 | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `options.timeoutMs` | `number \| undefined`                                                                  | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |

## Retour

`Task<T>`

## Signature

```ts
export declare function defineLoopTask<T>(options: LoopTaskOptions<T>): Task<T>;
```

## Contrats associés

- [LoopTaskOptions](../looptaskoptions/)
- [Task](../type-task/)
