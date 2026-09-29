---
title: "HarnessInstructionSource"
description: "HarnessInstructionSource — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessInstructionSource } from "@elie-laloum/outpost";
```

## Rôle et comportement

Texte d’instructions, ou fonction de HarnessInstructionContext (sandbox, signal, model, mcp) qui le renvoie, éventuellement de façon asynchrone. Accepté par defineHarnessInstructions() et par les instructions d’un skill ; un texte vide, ou une fonction qui ne se résout pas en chaîne, échoue avec le code configuration.

[Exemple complet et règles détaillées](../../guide/harness-context/).

## Signature

```ts
export type HarnessInstructionSource =
  string | ((context: HarnessInstructionContext) => string | Promise<string>);
```

## Contrats associés

- [HarnessInstructionContext](../harnessinstructioncontext/)
