---
title: "commandTask"
description: "commandTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { commandTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit un nœud qui exécute une commande dans une sandbox existante appartenant à l’appelant. Une fabrique de commande peut lire les dépendances. Un statut de processus non nul met la tâche en échec et permet d’appliquer sa politique de reprise ; la sandbox reste à la charge de l’appelant.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom                   | Type                                                                   | Présence  | Rôle                                                                                                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions`     | Requis    | Réglages d’ordonnancement, sandbox existante et commande ou fabrique de commande.                                                                                                                                             |
| `options.retry`       | `Retry \| undefined`                                                   | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                                                                                                                                                               |
| `options.key`         | `string`                                                               | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                                                                                                                          |
| `options.cache`       | `TaskCacheOptions \| undefined`                                        | Optionnel | Cache de résultat optionnel : une correspondance restaure la valeur JSON sans perte enregistrée, sans tentative, sans usage ni effet de bord. Refusé sur les gates, interactions et tâches renvoyant un résultat de dispatch. |
| `options.gate`        | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                  |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                                                                                                                     |
| `options.interaction` | `TaskInteraction \| undefined`                                         | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                  |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Prédicat évalué avant la première tentative.                                                                                                                                                                                  |
| `options.timeoutMs`   | `number \| undefined`                                                  | Optionnel | Durée entière positive en millisecondes de chaque tentative, jusqu’à 2147483647 ; l’annulation est coopérative via context.signal.                                                                                            |
| `options.sandbox`     | `Sandbox`                                                              | Requis    | Sandbox existante appartenant à l’appelant et réutilisée par la tâche ; la tâche ne la ferme pas.                                                                                                                             |
| `options.command`     | `Command \| ((context: TaskContext) => Command)`                       | Requis    | Commande à exécuter, ou fabrique la construisant depuis les valeurs des dépendances.                                                                                                                                          |

## Retour

`Task<CommandResult>`

## Signature

```ts
export declare function commandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions,
): Task<CommandResult>;
```

## Contrats associés

- [CommandResult](../commandresult/)
- [CommandTaskOptions](../support-commandtaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
