---
title: "HarnessInstructionSource"
description: "HarnessInstructionSource — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
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
