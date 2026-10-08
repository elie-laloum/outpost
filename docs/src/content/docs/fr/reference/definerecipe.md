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

Analyse et valide une recette YAML locale de version 1, lie ses étapes de commande et d’agent nommé à la sandbox fournie et renvoie un Workflow sans l’exécuter. Les dépendances peuvent référencer des tâches déclarées plus loin ; champs inconnus, clés dupliquées, constructions YAML non prises en charge, agents absents et graphes invalides lèvent une erreur avant exécution. L’appelant possède la sandbox. start() exige une concurrence de 1 et utilise les retries, l’annulation, les résultats et le suivi d’usage du workflow existant.

[Exemple complet et règles détaillées](../../guide/yaml-recipes/).

## Paramètres et propriétés

| Nom        | Type             | Présence | Rôle                                                                                                                                                                                                                                                                                                |
| ---------- | ---------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`   | `string`         | Requis   | Texte YAML 1.2 littéral contenant version: 1, name et une liste tasks non vide, limité à 1 Mio et 1 000 tâches ; les alias et tags personnalisés sont refusés. Chaque tâche choisit command ou agent avec brief, avec after, retry et timeoutMs optionnels. Les valeurs ne sont jamais interpolées. |
| `bindings` | `RecipeBindings` | Requis   | Sandbox ouverte et registre d’agents optionnel empruntés par chaque tâche de la recette. defineRecipe() n’alloue ni ne ferme de ressource ; l’appelant en conserve la propriété.                                                                                                                    |

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
