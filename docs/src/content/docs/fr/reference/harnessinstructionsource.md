---
title: "HarnessInstructionSource"
description: "HarnessInstructionSource — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le streaming n’est pas encore disponible ; le contrat peut changer avant publication.
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
