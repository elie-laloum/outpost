---
title: "HarnessInstructions"
description: "HarnessInstructions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import type { HarnessInstructions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                      | Présence | Rôle                                                                  |
| --------- | --------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| `kind`    | `"instructions"`                                          | Requis   | Discriminant de la définition : instructions.                         |
| `resolve` | `(context: HarnessInstructionContext) => Promise<string>` | Requis   | Produit le texte d’instructions d’une passe à partir de son contexte. |

## Signature

```ts
export interface HarnessInstructions {
  readonly kind: "instructions";
  resolve(context: HarnessInstructionContext): Promise<string>;
}
```

## Contrats associés

- [HarnessInstructionContext](../harnessinstructioncontext/)
