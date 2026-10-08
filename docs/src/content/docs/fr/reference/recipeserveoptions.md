---
title: "RecipeServeOptions"
description: "RecipeServeOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeServeOptions } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom       | Type                       | Présence  | Rôle                                                                                                      |
| --------- | -------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `service` | `string`                   | Requis    | Nom du service avec préfixe services. facultatif ; un nom absent échoue avant préparation des ressources. |
| `signal`  | `AbortSignal \| undefined` | Optionnel | Annule cette invocation tout en conservant la responsabilité de fermeture des dépendances préparées.      |

## Signature

```ts
export interface RecipeServeOptions {
  readonly service: string;
  readonly signal?: AbortSignal;
}
```
