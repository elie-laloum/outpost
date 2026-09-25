---
title: "queuedTask"
description: "queuedTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { queuedTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit un nœud qui envoie un travail durable dans la file et interroge sa progression. Déduit son identité de l’exécution et de la tâche, décode le résultat JSON et comptabilise l’usage renvoyé. Un worker enregistré exécute le gestionnaire distant.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom                 | Type                                                                   | Présence  | Rôle                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `QueuedTaskOptions<T>`                                                 | Requis    | Ordonnancement de tâche, gestionnaire de file, fabrique d’entrée, décodeur de résultat et interrogation.                     |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                    |
| `options.key`       | `string`                                                               | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                         |
| `options.gate`      | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante. |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Prédicat évalué avant la première tentative.                                                                                 |
| `options.retry`     | `Retry \| undefined`                                                   | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                                                              |
| `options.timeoutMs` | `number \| undefined`                                                  | Optionnel | Durée maximale en millisecondes de chaque tentative ; l’annulation est coopérative via context.signal.                       |
| `options.queue`     | `TaskQueue`                                                            | Requis    | File de tâches utilisée pour envoyer, prendre en charge et persister l’état des travaux.                                     |
| `options.handler`   | `string`                                                               | Requis    | Nom du gestionnaire enregistré du worker qui exécutera ce travail JSON.                                                      |
| `options.input`     | `(context: TaskContext) => WorkflowJson`                               | Requis    | Construit l’entrée JSON du travail en file depuis les dépendances de tâche.                                                  |
| `options.decode`    | `(value: WorkflowJson) => T`                                           | Requis    | Valide et décode le résultat JSON du worker dans le type de sortie de cette tâche.                                           |
| `options.deadline`  | `number \| undefined`                                                  | Optionnel | Échéance absolue du travail sous forme d’horodatage Unix en millisecondes.                                                   |
| `options.pollMs`    | `number \| undefined`                                                  | Optionnel | Intervalle en millisecondes entre les interrogations de la file.                                                             |

## Retour

`Task<T>`

## Signature

```ts
export declare function queuedTask<T>(options: QueuedTaskOptions<T>): Task<T>;
```

## Contrats associés

- [QueuedTaskOptions](../queuedtaskoptions/)
- [Task](../type-task/)
