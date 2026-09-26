---
title: "ToolValidation"
description: "ToolValidation — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le contrat peut changer avant publication.
:::

## Import

```ts
import type { ToolValidation } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom      | Type     | Présence          | Rôle                                                                          |
| -------- | -------- | ----------------- | ----------------------------------------------------------------------------- |
| `value`  | `Input`  | Selon la variante | Entrée validée transmise à execute.                                           |
| `issues` | `string` | Selon la variante | Problèmes de validation lisibles renvoyés au modèle comme résultat en erreur. |

## Signature

```ts
export type ToolValidation<Input> =
  | {
      readonly value: Input;
    }
  | {
      readonly issues: string;
    };
```
