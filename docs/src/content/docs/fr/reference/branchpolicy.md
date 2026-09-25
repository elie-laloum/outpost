---
title: "BranchPolicy"
description: "BranchPolicy — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { BranchPolicy } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom    | Type                                  | Présence          | Rôle                                                                                                                                        |
| ------ | ------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode` | `"current" \| "named" \| "integrate"` | Requis            | current utilise le checkout courant, named conserve une branche de travail choisie, integrate prépare une branche à fusionner dans la base. |
| `name` | `string`                              | Selon la variante | Nom de la branche de travail conservée en mode named.                                                                                       |
| `from` | `string \| undefined`                 | Selon la variante | Révision Git servant de point de départ à la branche de travail gérée.                                                                      |

## Signature

```ts
export type BranchPolicy =
  | {
      readonly mode: "current";
    }
  | {
      readonly mode: "named";
      readonly name: string;
      readonly from?: string;
    }
  | {
      readonly mode: "integrate";
      readonly from?: string;
    };
```
