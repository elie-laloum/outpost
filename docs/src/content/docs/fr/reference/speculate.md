---
title: "speculate"
description: "speculate — Outpost API"
sidebar:
  order: 10
---

Contrat public de **speculate**. Consultez le [guide exécution spéculative](../../workflows/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { speculate } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function speculate<T = undefined>(
  options: SpeculationOptions<T>,
): Promise<SpeculationResult<T>>;
```

## Contrats associés

- [SpeculationOptions](../speculationoptions/)
- [SpeculationResult](../speculationresult/)
