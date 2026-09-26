---
title: "ToolOutput"
description: "ToolOutput — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { ToolOutput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom       | Type                   | Présence          | Rôle                                                              |
| --------- | ---------------------- | ----------------- | ----------------------------------------------------------------- |
| `content` | `string`               | Selon la variante | Texte renvoyé au modèle pour l’appel.                             |
| `isError` | `boolean \| undefined` | Selon la variante | Signale l’échec de l’appel pour que le modèle puisse se corriger. |

## Signature

```ts
export type ToolOutput =
  | string
  | {
      readonly content: string;
      readonly isError?: boolean;
    };
```
