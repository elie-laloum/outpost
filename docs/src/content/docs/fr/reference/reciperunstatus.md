---
title: "RecipeRunStatus"
description: "RecipeRunStatus — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeRunStatus } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom           | Type                                                  | Présence  | Rôle                                                                                                                 |
| ------------- | ----------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------- |
| `runId`       | `string`                                              | Requis    | Identifiant du checkpoint durable demandé.                                                                           |
| `revision`    | `string`                                              | Requis    | Révision de stockage exacte utilisée pour protéger une récupération explicite du checkpoint.                         |
| `owned`       | `boolean`                                             | Requis    | Indique si le checkpoint enregistre un propriétaire ; ne prouve pas sa présence et n’autorise pas sa récupération.   |
| `executionId` | `string \| undefined`                                 | Optionnel | Identifiant d’exécution natif conservé entre les reprises, lorsqu’il est initialisé.                                 |
| `report`      | `RecipeReport \| undefined`                           | Optionnel | Dernier rapport d’invocation expurgé, renvoyé uniquement après libération de la propriété du checkpoint.             |
| `tasks`       | `readonly Readonly<TaskRecord>[]`                     | Requis    | Résumés en lecture seule des clés, statuts et tentatives ; l’état privé des interactions et leurs sorties sont omis. |
| `usage`       | `WorkflowUsage \| undefined`                          | Optionnel | Tentatives et jetons cumulés persistés, y compris les tentatives interrompues.                                       |
| `workspaces`  | `Readonly<Record<string, RecipeWorkspaceCheckpoint>>` | Requis    | État d’allocation persisté et identité Git d’origine de chaque workspace possédé par le runtime.                     |

## Signature

```ts
export interface RecipeRunStatus {
  readonly runId: string;
  readonly revision: string;
  readonly owned: boolean;
  readonly executionId?: string;
  readonly report?: RecipeReport;
  readonly tasks: WorkflowCheckpoint["records"];
  readonly usage?: WorkflowCheckpoint["usage"];
  readonly workspaces: Readonly<Record<string, RecipeWorkspaceCheckpoint>>;
}
```

## Contrats associés

- [RecipeReport](../support-recipereport/)
- [RecipeWorkspaceCheckpoint](../support-recipeworkspacecheckpoint/)
- [WorkflowCheckpoint](../workflowcheckpoint/)
