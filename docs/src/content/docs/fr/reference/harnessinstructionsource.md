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

## Signature

```ts
export type HarnessInstructionSource =
  string | ((context: HarnessInstructionContext) => string | Promise<string>);
```

## Contrats associés

- [HarnessInstructionContext](../harnessinstructioncontext/)
