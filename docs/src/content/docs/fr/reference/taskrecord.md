---
title: "TaskRecord"
description: "TaskRecord — Outpost API"
sidebar:
  order: 10
---

Contrat public de **TaskRecord**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { TaskRecord } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom             | Type                                  | Présence  | Rôle                                                                             |
| --------------- | ------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `usageReceipts` | `readonly string[] \| undefined`      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `pause`         | `WorkflowPauseRequest \| undefined`   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `decision`      | `WorkflowDecisionRecord \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `key`           | `string`                              | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                           |
| `status`        | `TaskStatus`                          | Requis    | Résultat enregistré du processus ou cycle de vie ; voir son type.                |
| `attempts`      | `number`                              | Requis    | Nombre de tentatives ou limite d’admission selon le contrat.                     |
| `startedAt`     | `string \| undefined`                 | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `finishedAt`    | `string \| undefined`                 | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `error`         | `string \| undefined`                 | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface TaskRecord {
  usageReceipts?: readonly string[];
  pause?: WorkflowPauseRequest;
  decision?: WorkflowDecisionRecord;
  readonly key: string;
  status: TaskStatus;
  attempts: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}
```

## Contrats associés

- [TaskStatus](../taskstatus/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowPauseRequest](../workflowpauserequest/)
