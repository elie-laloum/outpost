---
title: "WorkflowResult"
description: "WorkflowResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowResult**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom              | Type                                            | Présence | Rôle                                                                             |
| ---------------- | ----------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `executionId`    | `string`                                        | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `name`           | `string`                                        | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `status`         | `"done" \| "failed" \| "cancelled" \| "paused"` | Requis   | Résultat enregistré du processus ou cycle de vie ; voir son type.                |
| `tasks`          | `readonly Readonly<TaskRecord>[]`               | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `errors`         | `readonly unknown[]`                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `observerErrors` | `readonly unknown[]`                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `usage`          | `WorkflowUsage`                                 | Requis   | Compteurs d’usage rapportés ; aucune estimation monétaire.                       |
| `value`          | `<T>(task: Task<T>) => T`                       | Requis   | Valeur typée produite ou consommée par ce contrat.                               |
| `unwrap`         | `() => void`                                    | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface WorkflowResult {
  readonly executionId: string;
  readonly name: string;
  readonly status: "done" | "failed" | "cancelled" | "paused";
  readonly tasks: readonly Readonly<TaskRecord>[];
  readonly errors: readonly unknown[];
  readonly observerErrors: readonly unknown[];
  readonly usage: WorkflowUsage;
  value<T>(task: Task<T>): T;
  unwrap(): void;
}
```

## Contrats associés

- [Task](../task/)
- [TaskRecord](../taskrecord/)
- [WorkflowUsage](../workflowusage/)
