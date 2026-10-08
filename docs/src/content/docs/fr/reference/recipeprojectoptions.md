---
title: "RecipeProjectOptions"
description: "RecipeProjectOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeProjectOptions } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom        | Type                          | Présence  | Rôle                                                                                                            |
| ---------- | ----------------------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `file`     | `string`                      | Requis    | Chemin de recette YAML résolu depuis le dossier courant du processus.                                           |
| `config`   | `string`                      | Requis    | Chemin obligatoire du YAML local d’exécution séparé ; son dossier ancre les chemins du dépôt et des extensions. |
| `registry` | `RecipeRegistry \| undefined` | Optionnel | Descripteurs de confiance supplémentaires combinés aux composants natifs ; les noms dupliqués échouent.         |

## Signature

```ts
export interface RecipeProjectOptions {
  readonly file: string;
  readonly config: string;
  readonly registry?: RecipeRegistry;
}
```

## Contrats associés

- [RecipeRegistry](../reciperegistry/)
