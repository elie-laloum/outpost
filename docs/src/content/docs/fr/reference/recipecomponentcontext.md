---
title: "RecipeComponentContext"
description: "RecipeComponentContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeComponentContext } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom           | Type                                               | Présence | Rôle                                                                                                        |
| ------------- | -------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `directory`   | `string`                                           | Requis   | Dossier absolu du YAML d’exécution local ; les chemins d’extensions locales s’y résolvent.                  |
| `signal`      | `AbortSignal`                                      | Requis   | Annulation partagée avec l’invocation active de la recette.                                                 |
| `resolve`     | `(name: string, kind: string) => Promise<unknown>` | Requis   | Résout un composant nommé en exigeant sa catégorie déclarée ; les demandes répétées partagent son instance. |
| `environment` | `(name: string) => string`                         | Requis   | Lit une variable hôte explicitement nommée ; les noms invalides ou absents échouent.                        |

## Signature

```ts
export interface RecipeComponentContext {
  readonly directory: string;
  readonly signal: AbortSignal;
  resolve(name: string, kind: string): Promise<unknown>;
  environment(name: string): string;
}
```
