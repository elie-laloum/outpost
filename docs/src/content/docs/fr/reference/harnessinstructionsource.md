---
title: "HarnessInstructionSource"
description: "HarnessInstructionSource — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessInstructionSource } from "@elie-laloum/outpost";
```

## Signature

```ts
export type HarnessInstructionSource =
  string | ((context: HarnessInstructionContext) => string | Promise<string>);
```

## Contrats associés

- [HarnessInstructionContext](../harnessinstructioncontext/)
