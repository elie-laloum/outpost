---
title: "defineHarnessInstructions"
description: "defineHarnessInstructions — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessInstructions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit des instructions système à partir d’un texte ou d’un résolveur appelé au début de chaque tour avec la sandbox, le signal, le modèle et le contexte MCP. Le texte résolu n’est pas stocké dans la conversation.

[Exemple complet et règles détaillées](../../guide/harness-context/).

## Paramètres et propriétés

| Nom      | Type                       | Présence | Rôle                                                                                                            |
| -------- | -------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `source` | `HarnessInstructionSource` | Requis   | Texte d’instructions non vide, ou fonction qui reçoit le contexte du tour et renvoie le texte au début du tour. |

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
