---
title: "WorkflowEvent"
description: "WorkflowEvent — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowEvent**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowEvent } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom           | Type                                                               | Présence  | Rôle                                                                             |
| ------------- | ------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------- |
| `executionId` | `string`                                                           | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `workflow`    | `string`                                                           | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `timestamp`   | `string`                                                           | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `type`        | `"usage" \| "retry" \| "start" \| "task" \| "attempt" \| "finish"` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `key`         | `string \| undefined`                                              | Optionnel | Clé stable de tâche ou cache dans le contrat concerné.                           |
| `status`      | `TaskStatus \| undefined`                                          | Optionnel | Résultat enregistré du processus ou cycle de vie ; voir son type.                |
| `attempt`     | `number \| undefined`                                              | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `usage`       | `Usage \| undefined`                                               | Optionnel | Compteurs d’usage rapportés ; aucune estimation monétaire.                       |
| `durationMs`  | `number \| undefined`                                              | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface WorkflowEvent {
  readonly executionId: string;
  readonly workflow: string;
  readonly timestamp: string;
  readonly type: "start" | "task" | "attempt" | "retry" | "usage" | "finish";
  readonly key?: string;
  readonly status?: TaskStatus;
  readonly attempt?: number;
  readonly usage?: Usage;
  readonly durationMs?: number;
}
```

## Contrats associés

- [TaskStatus](../taskstatus/)
- [Usage](../usage/)
