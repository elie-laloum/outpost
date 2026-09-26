---
title: "HarnessInstructionsOption"
description: "HarnessInstructionsOption — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Hooks, permissions, conversations persistées et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessInstructionsOption } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom       | Type                                                      | Présence          | Rôle                                                                  |
| --------- | --------------------------------------------------------- | ----------------- | --------------------------------------------------------------------- |
| `kind`    | `"instructions"`                                          | Selon la variante | Discriminant de la définition : instructions.                         |
| `resolve` | `(context: HarnessInstructionContext) => Promise<string>` | Selon la variante | Produit le texte d’instructions d’une passe à partir de son contexte. |

## Signature

```ts
export type HarnessInstructionsOption =
  string | HarnessInstructions | readonly (string | HarnessInstructions)[];
```

## Contrats associés

- [HarnessInstructions](../harnessinstructions/)
