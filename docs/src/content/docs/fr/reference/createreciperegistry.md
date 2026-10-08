---
title: "createRecipeRegistry"
description: "createRecipeRegistry — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createRecipeRegistry } from "@elie-laloum/outpost/recipes";
```

## Rôle et comportement

Crée un registre immuable de descripteurs supplémentaires. Les doublons échouent immédiatement ; le runtime combine ce registre avec ses descripteurs natifs.

[Exemple complet et règles détaillées](../../guide/yaml-recipes/).

## Paramètres et propriétés

| Nom                  | Type                                                | Présence  | Rôle                                                                                          |
| -------------------- | --------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`            | `RecipeRegistryOptions \| undefined`                | Optionnel | Descripteurs nommés supplémentaires ; omettre les options crée un registre d’extensions vide. |
| `options.components` | `readonly RecipeComponentDefinition[] \| undefined` | Optionnel | Descripteurs supplémentaires de factories, chacun avec un nom unique.                         |

## Retour

`RecipeRegistry`

## Signature

```ts
export declare function createRecipeRegistry(
  options?: RecipeRegistryOptions,
): RecipeRegistry;
```

## Contrats associés

- [RecipeRegistry](../reciperegistry/)
- [RecipeRegistryOptions](../reciperegistryoptions/)
