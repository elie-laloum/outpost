---
title: "SpeculativeValidation"
description: "SpeculativeValidation — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SpeculativeValidation**. Consultez le [guide exécution spéculative](../../workflows/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SpeculativeValidation } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface SpeculativeValidation<T> {
  readonly key: string;
  readonly result: SpeculativeOutput<T>;
  readonly sandbox: Sandbox;
  readonly signal: AbortSignal;
}
```

## Contrats associés

- [Sandbox](../sandbox/)
- [SpeculativeOutput](../speculativeoutput/)
