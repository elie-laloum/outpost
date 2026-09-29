---
title: "defineTask"
description: "defineTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit et fige un nœud de workflow dont le callback perform s’exécute après la réussite de ses dépendances. Créer le nœud ne l’exécute pas et n’alloue aucune sandbox. context.value lit les dépendances déclarées ; defineIsolatedTask prend en charge l’allocation d’une sandbox autour d’un dispatch d’agent à la place d’un callback perform personnalisé.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom                   | Type                                                                   | Présence  | Rôle                                                                                                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `TaskOptions<T>`                                                       | Requis    | Identité de tâche, dépendances, callback perform et politique de tentatives.                                                                                                                                                  |
| `options.retry`       | `Retry \| undefined`                                                   | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                                                                                                                                                               |
| `options.key`         | `string`                                                               | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                                                                                                                          |
| `options.cache`       | `TaskCacheOptions \| undefined`                                        | Optionnel | Cache de résultat optionnel : une correspondance restaure la valeur JSON sans perte enregistrée, sans tentative, sans usage ni effet de bord. Refusé sur les gates, interactions et tâches renvoyant un résultat de dispatch. |
| `options.gate`        | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                  |
| `options.interaction` | `TaskInteraction \| undefined`                                         | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                  |
| `options.perform`     | `(context: TaskContext) => T \| Promise<T>`                            | Requis    | Callback exécuté à chaque tentative ; renvoie sa sortie et doit respecter context.signal.                                                                                                                                     |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Prédicat évalué avant la première tentative.                                                                                                                                                                                  |
| `options.timeoutMs`   | `number \| undefined`                                                  | Optionnel | Durée entière positive en millisecondes de chaque tentative, jusqu’à 2147483647 ; l’annulation est coopérative via context.signal.                                                                                            |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                                                                                                                     |

## Retour

`Task<T>`

## Signature

```ts
export declare function defineTask<T>(options: TaskOptions<T>): Task<T>;
```

## Contrats associés

- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
