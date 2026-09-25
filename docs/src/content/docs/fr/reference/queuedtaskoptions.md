---
title: "QueuedTaskOptions"
description: "QueuedTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { QueuedTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                   | Présence  | Rôle                                                                                                                         |
| ----------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `after`     | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                    |
| `key`       | `string`                                                               | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                         |
| `gate`      | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante. |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Prédicat évalué avant la première tentative.                                                                                 |
| `retry`     | `Retry \| undefined`                                                   | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                                                              |
| `timeoutMs` | `number \| undefined`                                                  | Optionnel | Durée maximale en millisecondes de chaque tentative ; l’annulation est coopérative via context.signal.                       |
| `queue`     | `TaskQueue`                                                            | Requis    | File de tâches utilisée pour envoyer, prendre en charge et persister l’état des travaux.                                     |
| `handler`   | `string`                                                               | Requis    | Nom du gestionnaire enregistré du worker qui exécutera ce travail JSON.                                                      |
| `input`     | `(context: TaskContext) => WorkflowJson`                               | Requis    | Construit l’entrée JSON du travail en file depuis les dépendances de tâche.                                                  |
| `decode`    | `(value: WorkflowJson) => T`                                           | Requis    | Valide et décode le résultat JSON du worker dans le type de sortie de cette tâche.                                           |
| `deadline`  | `number \| undefined`                                                  | Optionnel | Échéance absolue du travail sous forme d’horodatage Unix en millisecondes.                                                   |
| `pollMs`    | `number \| undefined`                                                  | Optionnel | Intervalle en millisecondes entre les interrogations de la file.                                                             |

## Signature

```ts
export type QueuedTaskOptions<T> = Omit<TaskOptions<T>, "perform"> & {
  readonly queue: TaskQueue;
  readonly handler: string;
  readonly input: (context: TaskContext) => WorkflowJson;
  readonly decode: (value: WorkflowJson) => T;
  readonly deadline?: number;
  readonly pollMs?: number;
};
```

## Contrats associés

- [TaskContext](../taskcontext/)
- [TaskOptions](../taskoptions/)
- [TaskQueue](../taskqueue/)
- [WorkflowJson](../workflowjson/)
