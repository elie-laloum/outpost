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

| Nom    | Type                                  | Présence          | Rôle                                                                                                                                                                                                                                     |
| ------ | ------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode` | `"current" \| "named" \| "integrate"` | Requis            | current travaille dans le checkout lui-même ; named travaille sur la branche name dans un worktree sous .outpost/workspaces ; integrate y crée une branche outpost/&lt;label>-&lt;id>, que integrate() fusionne dans la branche de base. |
| `name` | `string`                              | Selon la variante | Branche de travail du mode named, conservée à la fermeture du workspace. Une branche existante repart de sa pointe et réutilise son worktree géré ; une branche extraite hors de .outpost/workspaces échoue avec le code conflict.       |
| `from` | `string \| undefined`                 | Selon la variante | Révision de départ d’une nouvelle branche de travail, HEAD par défaut. Ignorée quand la branche named existe déjà.                                                                                                                       |

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
