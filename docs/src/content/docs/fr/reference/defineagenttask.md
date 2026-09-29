---
title: "defineAgentTask"
description: "defineAgentTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineAgentTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit un nœud de workflow qui lance un agent dans une sandbox existante appartenant à l’appelant. request construit le brief et les options depuis les dépendances. L’annulation et l’usage observé sont reliés au workflow ; le nœud ne ferme pas la sandbox partagée.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom                   | Type                                                                               | Présence  | Rôle                                                                                                                                                                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`             | `Omit<TaskOptions<DispatchResult<T>>, "cache" \| "perform"> & AgentTaskOptions<T>` | Requis    | Réglages d’ordonnancement, sandbox existante et fabrique de requêtes de dispatch.                                                                                                                                                                                                                |
| `options.retry`       | `Retry \| undefined`                                                               | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                                                                                                                                                                                                                                  |
| `options.key`         | `string`                                                                           | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                                                                                                                                                                                             |
| `options.gate`        | `WorkflowGate \| undefined`                                                        | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                     |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                            | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                                                                                                                                                                                        |
| `options.interaction` | `TaskInteraction \| undefined`                                                     | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                     |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`             | Optionnel | Prédicat évalué avant la première tentative.                                                                                                                                                                                                                                                     |
| `options.timeoutMs`   | `number \| undefined`                                                              | Optionnel | Durée entière positive en millisecondes de chaque tentative, jusqu’à 2147483647 ; l’annulation est coopérative via context.signal.                                                                                                                                                               |
| `options.sandbox`     | `Sandbox`                                                                          | Requis    | Sandbox existante appartenant à l’appelant et réutilisée par la tâche ; la tâche ne la ferme pas.                                                                                                                                                                                                |
| `options.request`     | `(context: TaskContext) => DispatchOptions<T>`                                     | Requis    | Construit les options de dispatch depuis les dépendances pour la sandbox existante.                                                                                                                                                                                                              |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                   | Optionnel | Après une pause sur quota, poursuit la conversation capturée avec une consigne de reprise (continue, par défaut) ou renvoie la requête d’origine (restart). La poursuite est ignorée si l’agent ne peut pas reprendre, si la requête fournit sa propre continuation ou utilise plusieurs passes. |

## Retour

`Task<DispatchResult<T>>`

## Signature

```ts
export declare function defineAgentTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform" | "cache"> &
    AgentTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Contrats associés

- [AgentTaskOptions](../support-agenttaskoptions/)
- [DispatchResult](../dispatchresult/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
