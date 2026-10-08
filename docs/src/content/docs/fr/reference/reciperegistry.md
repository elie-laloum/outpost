---
title: "RecipeRegistry"
description: "RecipeRegistry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeRegistry } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom          | Type                                          | Présence | Rôle                                                                          |
| ------------ | --------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `components` | `readonly RecipeComponentDefinition[]`        | Requis   | Liste immuable des descripteurs de composants enregistrés.                    |
| `get`        | `(name: string) => RecipeComponentDefinition` | Requis   | Recherche un nom exact de factory ; les noms inconnus échouent explicitement. |

## Signature

```ts
export interface RecipeRegistry {
  readonly components: readonly RecipeComponentDefinition[];
  get(name: string): RecipeComponentDefinition;
}
```

## Contrats associés

- [RecipeComponentDefinition](../recipecomponentdefinition/)
