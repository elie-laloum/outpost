---
title: "speculate"
description: "speculate — Outpost API"
sidebar:
  order: 10
---

Public contract for **speculate**. See the [speculative execution guide](../../workflows/speculation/) for behavior, defaults and examples.

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

## Related contracts

- [SpeculationOptions](../speculationoptions/)
- [SpeculationResult](../speculationresult/)
