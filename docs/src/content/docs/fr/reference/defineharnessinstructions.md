---
title: "defineHarnessInstructions"
description: "defineHarnessInstructions — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import { defineHarnessInstructions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit des instructions système à partir d’un texte ou d’un résolveur appelé au début de chaque passe avec le sandbox, le signal et le modèle. Le texte résolu n’est pas stocké dans la conversation.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom      | Type                       | Présence | Rôle                                                                                                                               |
| -------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `source` | `HarnessInstructionSource` | Requis   | Texte d’instructions non vide, ou fonction qui reçoit le sandbox, le signal et le modèle et renvoie le texte au début d’une passe. |

## Retour

`HarnessInstructions`

## Signature

```ts
export declare function defineHarnessInstructions(
  source: HarnessInstructionSource,
): HarnessInstructions;
```

## Contrats associés

- [HarnessInstructions](../harnessinstructions/)
- [HarnessInstructionSource](../harnessinstructionsource/)
