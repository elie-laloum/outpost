---
title: "defineRecipeComponent"
description: "defineRecipeComponent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineRecipeComponent } from "@elie-laloum/outpost/recipes";
```

## Rôle et comportement

Déclare une factory YAML nommée avec schéma statique des options, validation du résultat et nettoyage optionnel des ressources possédées. La déclaration ne lance pas la factory.

[Exemple complet et règles détaillées](../../guide/yaml-recipes/).

## Paramètres et propriétés

| Nom          | Type                        | Présence | Rôle                                                                                         |
| ------------ | --------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `definition` | `RecipeComponentDefinition` | Requis   | Descripteur de factory à valider et figer ; il définit un nom et une catégorie de composant. |

## Retour

`RecipeComponentDefinition`

## Signature

```ts
export declare function defineRecipeComponent(
  definition: RecipeComponentDefinition,
): RecipeComponentDefinition;
```

## Contrats associés

- [RecipeComponentDefinition](../recipecomponentdefinition/)
