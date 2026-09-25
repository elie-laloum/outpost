---
title: "Workflow"
description: "Workflow — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Workflow**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Workflow } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom       | Type                                                     | Présence | Rôle                                                                             |
| --------- | -------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `name`    | `string`                                                 | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `tasks`   | `readonly Task<unknown>[]`                               | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `start`   | `(options?: WorkflowOptions) => Promise<WorkflowResult>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `diagram` | `() => string`                                           | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface Workflow {
  readonly name: string;
  readonly tasks: readonly Task[];
  start(options?: WorkflowOptions): Promise<WorkflowResult>;
  diagram(): string;
}
```

## Contrats associés

- [Task](../task/)
- [WorkflowOptions](../workflowoptions/)
- [WorkflowResult](../workflowresult/)
