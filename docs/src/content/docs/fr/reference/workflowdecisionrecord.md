---
title: "WorkflowDecisionRecord"
description: "WorkflowDecisionRecord — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowDecisionRecord**. Consultez le [guide approbations et pauses](../../guide/advanced/approvals/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowDecisionRecord } from "@elie-laloum/outpost";
```

## Rôle et comportement

Persister une décision attendue et bloquer les dépendants jusqu’à sa soumission par un appelant de confiance.

Les noms d’acteurs sont des métadonnées de confiance, pas une authentification. Une pause ne nécessite aucun timer. Le rejet est définitif pour cette exécution. Un lot invalide échoue avant toute application.

[Exemple complet et règles détaillées](../../guide/advanced/approvals/).

## Paramètres et propriétés

| Nom           | Type                                | Présence | Rôle                                                                             |
| ------------- | ----------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `decidedAt`   | `string`                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `executionId` | `string`                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `key`         | `string`                            | Requis   | Clé stable de tâche ou cache dans le contrat concerné.                           |
| `requestId`   | `string`                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `action`      | `"resume" \| "approve" \| "reject"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `actor`       | `string`                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `reason`      | `string`                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface WorkflowDecisionRecord extends WorkflowDecision {
  readonly decidedAt: string;
}
```

## Contrats associés

- [WorkflowDecision](../workflowdecision/)
