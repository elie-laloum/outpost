---
title: "RecipeProjectSources"
description: "RecipeProjectSources — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeProjectSources } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom      | Type                  | Présence  | Rôle                                                                                                                                             |
| -------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `recipe` | `string \| undefined` | Optionnel | Texte YAML de recette lu à la place du fichier désigné par \`file\` ; les diagnostics nomment toujours ce fichier.                               |
| `config` | `string \| undefined` | Optionnel | Texte YAML de configuration lu à la place du fichier désigné par \`config\` ; son dossier ancre toujours les chemins du dépôt et des extensions. |

## Signature

```ts
export interface RecipeProjectSources {
  readonly recipe?: string;
  readonly config?: string;
}
```
