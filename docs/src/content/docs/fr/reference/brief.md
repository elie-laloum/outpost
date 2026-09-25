---
title: "Brief"
description: "Brief — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Brief } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom      | Type                                                                              | Présence          | Rôle                                                                                                   |
| -------- | --------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `text`   | `string \| undefined`                                                             | Selon la variante | Texte littéral du brief ; exclut un fichier modèle et des valeurs de substitution.                     |
| `file`   | `undefined \| string`                                                             | Selon la variante | Fichier modèle de brief à charger et développer ; mutuellement exclusif avec text.                     |
| `values` | `undefined \| Readonly<Record<string, string \| number \| boolean>> \| undefined` | Optionnel         | Valeurs substituées aux variables du brief fichier ; indisponibles pour les briefs textuels littéraux. |

## Signature

```ts
export type Brief =
  | {
      readonly text: string;
      readonly file?: never;
      readonly values?: never;
    }
  | {
      readonly file: string;
      readonly text?: never;
      readonly values?: PromptVariables;
    };
```

## Contrats associés

- [PromptVariables](../promptvariables/)
