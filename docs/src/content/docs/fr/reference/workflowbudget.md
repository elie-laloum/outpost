---
title: "WorkflowBudget"
description: "WorkflowBudget — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowBudget } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                          | Présence  | Rôle                                                                                                                     |
| ---------- | ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| `attempts` | `number \| undefined`         | Optionnel | Nombre maximal cumulé de tentatives de tâches que le workflow peut admettre.                                             |
| `usage`    | `Partial<Usage> \| undefined` | Optionnel | Seuils d’admission par compteur de tokens ; l’usage observé peut dépasser le seuil pendant la fin du travail déjà admis. |

## Signature

```ts
export interface WorkflowBudget {
  readonly attempts?: number;
  readonly usage?: Partial<Usage>;
}
```

## Contrats associés

- [Usage](../usage/)
