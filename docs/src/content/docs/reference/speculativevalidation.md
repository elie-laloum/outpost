---
title: "SpeculativeValidation"
description: "SpeculativeValidation — Outpost API"
sidebar:
  order: 10
---

Public contract for **SpeculativeValidation**. See the [speculative execution guide](../../workflows/speculation/) for behavior, defaults and examples.

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

## Related contracts

- [Sandbox](../sandbox/)
- [SpeculativeOutput](../speculativeoutput/)
