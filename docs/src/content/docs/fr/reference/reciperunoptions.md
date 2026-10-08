---
title: "RecipeRunOptions"
description: "RecipeRunOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeRunOptions } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom      | Type                                                                 | Présence  | Rôle                                                                                                               |
| -------- | -------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `inputs` | `Readonly<Record<string, string \| number \| boolean>> \| undefined` | Optionnel | Paramètres explicites de recette ; valeurs obligatoires et défauts sont vérifiés avant les imports d’extensions.   |
| `signal` | `AbortSignal \| undefined`                                           | Optionnel | Annule cette invocation en attendant le nettoyage des ressources possédées.                                        |
| `report` | `"json" \| undefined`                                                | Optionnel | Remplace explicitement les rapports finaux configurés par un rapport JSON sur stdout ; n’active pas l’observation. |

## Signature

```ts
export interface RecipeRunOptions {
  readonly inputs?: Readonly<Record<string, string | number | boolean>>;
  readonly signal?: AbortSignal;
  readonly report?: "json";
}
```
