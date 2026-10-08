---
title: "RecipeProjectValidation"
description: "RecipeProjectValidation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeProjectValidation } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom                    | Type                | Présence | Rôle                                                                                   |
| ---------------------- | ------------------- | -------- | -------------------------------------------------------------------------------------- |
| `name`                 | `string`            | Requis   | Nom de la recette validée.                                                             |
| `version`              | `number`            | Requis   | Version du format lue dans la recette.                                                 |
| `configurationVersion` | `number`            | Requis   | Version du format lue dans le fichier d’exécution.                                     |
| `tasks`                | `readonly string[]` | Requis   | Clés des tâches dans l’ordre des dépendances.                                          |
| `agents`               | `readonly string[]` | Requis   | Rôles d’agents distincts requis par la recette.                                        |
| `extensions`           | `readonly string[]` | Requis   | Noms des extensions dont les métadonnées ont été validées sans importer leurs modules. |

## Signature

```ts
export interface RecipeProjectValidation {
  readonly name: string;
  readonly version: number;
  readonly configurationVersion: number;
  readonly tasks: readonly string[];
  readonly agents: readonly string[];
  readonly extensions: readonly string[];
}
```
