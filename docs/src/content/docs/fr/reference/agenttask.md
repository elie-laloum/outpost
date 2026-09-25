---
title: "agentTask"
description: "agentTask — Outpost API"
sidebar:
  order: 10
---

Contrat public de **agentTask**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { agentTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom                 | Type                                                                    | Présence  | Rôle                                                                                          |
| ------------------- | ----------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`           | `Omit<TaskOptions<DispatchResult<T>>, "perform"> & AgentTaskOptions<T>` | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                 | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                     |
| `options.key`       | `string`                                                                | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                                        |
| `options.gate`      | `WorkflowGate \| undefined`                                             | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optionnel | Prédicat évalué avant la première tentative.                                                  |
| `options.retry`     | `Retry \| undefined`                                                    | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                               |
| `options.timeoutMs` | `number \| undefined`                                                   | Optionnel | Délai en millisecondes pour l’opération concernée.                                            |
| `options.sandbox`   | `Sandbox`                                                               | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.request`   | `(context: TaskContext) => DispatchOptions<T>`                          | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

## Retour

`Task<DispatchResult<T>>`

## Signature

```ts
export declare function agentTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform"> &
    AgentTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Contrats associés

- [AgentTaskOptions](../support-agenttaskoptions/)
- [DispatchResult](../dispatchresult/)
- [Task](../task/)
- [TaskOptions](../taskoptions/)
