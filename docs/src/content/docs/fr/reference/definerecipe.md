---
title: "defineRecipe"
description: "defineRecipe — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineRecipe } from "@elie-laloum/outpost";
```

## Rôle et comportement

Analyse et valide une recette YAML locale, puis la compile en Workflow. Le format 1 conserve les chaînes littérales ; le format 2 ajoute des paramètres scalaires typés et les références aux dépendances directes ; le format 3 ajoute des paramètres structurés, conditions, callbacks, boucles, décisions et tâches isolées. Le moteur emprunte la sandbox fournie : l’appelant possède l’intégration et le nettoyage. Les tâches isolées possèdent leurs ressources distinctes. Les reprises après échec, l’annulation et le suivi de consommation des workflows s’appliquent.

[Exemple complet et règles détaillées](../../guide/yaml-recipes/).

## Paramètres et propriétés

| Nom        | Type                  | Présence | Rôle                                                                                                                                                                                                                                                           |
| ---------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`   | `string`              | Requis   | Texte YAML 1.2 au format de recette 1 (littéral) ou 2 (paramètres typés et références explicites), limité à 1 Mio et 1 000 tâches. Les champs inconnus, constructions YAML non prises en charge, graphes et références invalides sont refusés avant exécution. |
| `bindings` | `MixedRecipeBindings` | Requis   | Sandbox ouverte et registre d’agents optionnel empruntés par chaque tâche de la recette. defineRecipe() n’alloue ni ne ferme de ressource ; l’appelant en conserve la propriété.                                                                               |

## Retour

`Workflow`

## Signature

```ts
export declare function defineRecipe(
  source: string,
  bindings: MixedRecipeBindings,
): Workflow;
```

## Contrats associés

- [MixedRecipeBindings](../mixedrecipebindings/)
- [Workflow](../type-workflow/)
