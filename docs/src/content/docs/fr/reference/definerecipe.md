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

Analyse et valide une recette YAML locale, lie commandes et agents nommés à la sandbox de l’appelant et renvoie un Workflow séquentiel. La version 1 garde les chaînes littérales ; la version 2 résout les paramètres typés et les références explicites aux sorties des dépendances directes. N’alloue, n’intègre et ne ferme jamais la sandbox ; l’appelant possède ces actions. Les retries, l’annulation et le suivi de consommation des workflows restent disponibles.

[Exemple complet et règles détaillées](../../guide/yaml-recipes/).

## Paramètres et propriétés

| Nom        | Type             | Présence | Rôle                                                                                                                                                                                                                                                           |
| ---------- | ---------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`   | `string`         | Requis   | Texte YAML 1.2 au format de recette 1 (littéral) ou 2 (paramètres typés et références explicites), limité à 1 Mio et 1 000 tâches. Les champs inconnus, constructions YAML non prises en charge, graphes et références invalides sont refusés avant exécution. |
| `bindings` | `RecipeBindings` | Requis   | Sandbox ouverte et registre d’agents optionnel empruntés par chaque tâche de la recette. defineRecipe() n’alloue ni ne ferme de ressource ; l’appelant en conserve la propriété.                                                                               |

## Retour

`Workflow`

## Signature

```ts
export declare function defineRecipe(
  source: string,
  bindings: RecipeBindings,
): Workflow;
```

## Contrats associés

- [RecipeBindings](../recipebindings/)
- [Workflow](../type-workflow/)
