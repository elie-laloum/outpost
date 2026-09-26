---
title: "TruncateToolResultsOptions"
description: "TruncateToolResultsOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le contrat peut changer avant publication.
:::

## Import

```ts
import type { TruncateToolResultsOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                  | Présence  | Rôle                                                                                          |
| --------------- | --------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `keepRecent`    | `number \| undefined` | Optionnel | Nombre de messages de résultats d’outils les plus récents conservés intacts ; 4 par défaut.   |
| `maxCharacters` | `number \| undefined` | Optionnel | Longueur à laquelle les anciens résultats d’outils sont coupés ; 2 000 caractères par défaut. |

## Signature

```ts
export interface TruncateToolResultsOptions {
  readonly keepRecent?: number;
  readonly maxCharacters?: number;
}
```
