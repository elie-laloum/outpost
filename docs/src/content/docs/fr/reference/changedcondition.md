---
title: "ChangedCondition"
description: "ChangedCondition — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ChangedCondition } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                | Présence | Rôle                                                                                                                                                                                                                    |
| ------- | ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`  | `"changed"`         | Requis   | Discriminant littéral changed utilisé par la préparation pour sélectionner les vérifications de contenu.                                                                                                                |
| `files` | `readonly string[]` | Requis   | Fichiers exacts à hacher dans l’ordre déclaré, relatifs au répertoire de la commande dans l’environnement du hook. Les fichiers absents sont des entrées stables ; les fichiers illisibles font échouer la préparation. |

## Signature

```ts
export interface ChangedCondition {
  readonly kind: "changed";
  readonly files: readonly string[];
}
```
