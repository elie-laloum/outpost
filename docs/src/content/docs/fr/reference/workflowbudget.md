---
title: "WorkflowBudget"
description: "WorkflowBudget — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowBudget**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowBudget } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom        | Type                          | Présence  | Rôle                                                         |
| ---------- | ----------------------------- | --------- | ------------------------------------------------------------ |
| `attempts` | `number \| undefined`         | Optionnel | Nombre de tentatives ou limite d’admission selon le contrat. |
| `usage`    | `Partial<Usage> \| undefined` | Optionnel | Compteurs d’usage rapportés ; aucune estimation monétaire.   |

## Signature

```ts
export interface WorkflowBudget {
  readonly attempts?: number;
  readonly usage?: Partial<Usage>;
}
```

## Contrats associés

- [Usage](../usage/)
