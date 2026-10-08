---
title: "validateRecipeProject"
description: "validateRecipeProject — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { validateRecipeProject } from "@elie-laloum/outpost/recipes";
```

## Rôle et comportement

Lit la recette et la configuration séparées, puis valide graphe, références de composants et métadonnées des extensions. N’importe aucun module utilisateur, ne lit aucune valeur secrète et n’alloue aucune sandbox. Les exports des extensions sont vérifiés à l’exécution.

[Exemple complet et règles détaillées](../../guide/yaml-recipes/).

## Paramètres et propriétés

| Nom                | Type                          | Présence  | Rôle                                                                                                            |
| ------------------ | ----------------------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `options`          | `RecipeProjectOptions`        | Requis    | Chemins des deux YAML et descripteurs optionnels utilisés pour valider les composants nommés.                   |
| `options.file`     | `string`                      | Requis    | Chemin de recette YAML résolu depuis le dossier courant du processus.                                           |
| `options.config`   | `string`                      | Requis    | Chemin obligatoire du YAML local d’exécution séparé ; son dossier ancre les chemins du dépôt et des extensions. |
| `options.registry` | `RecipeRegistry \| undefined` | Optionnel | Descripteurs de confiance supplémentaires combinés aux composants natifs ; les noms dupliqués échouent.         |

## Retour

`Promise<RecipeProjectValidation>`

## Signature

```ts
export declare function validateRecipeProject(
  options: RecipeProjectOptions,
): Promise<RecipeProjectValidation>;
```

## Contrats associés

- [RecipeProjectOptions](../recipeprojectoptions/)
- [RecipeProjectValidation](../recipeprojectvalidation/)
