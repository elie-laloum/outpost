---
title: "createRecipeRuntime"
description: "createRecipeRuntime — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createRecipeRuntime } from "@elie-laloum/outpost/recipes";
```

## Rôle et comportement

Valide un projet YAML et crée un runtime appartenant à l’appelant. Chaque exécution importe les extensions déclarées, crée ses composants et sa sandbox, exécute le workflow, intègre selon la politique de branche puis ferme les ressources avant les rapports explicitement configurés.

[Exemple complet et règles détaillées](../../guide/yaml-recipes/).

## Paramètres et propriétés

| Nom                | Type                          | Présence  | Rôle                                                                                                            |
| ------------------ | ----------------------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `options`          | `RecipeProjectOptions`        | Requis    | Chemins de recette et de configuration locale, avec descripteurs optionnels fournis par l’appelant.             |
| `options.file`     | `string`                      | Requis    | Chemin de recette YAML résolu depuis le dossier courant du processus.                                           |
| `options.config`   | `string`                      | Requis    | Chemin obligatoire du YAML local d’exécution séparé ; son dossier ancre les chemins du dépôt et des extensions. |
| `options.registry` | `RecipeRegistry \| undefined` | Optionnel | Descripteurs de confiance supplémentaires combinés aux composants natifs ; les noms dupliqués échouent.         |

## Retour

`Promise<RecipeRuntime>`

## Signature

```ts
export declare function createRecipeRuntime(
  options: RecipeProjectOptions,
): Promise<RecipeRuntime>;
```

## Contrats associés

- [RecipeProjectOptions](../recipeprojectoptions/)
- [RecipeRuntime](../reciperuntime/)
