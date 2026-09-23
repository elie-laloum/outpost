---
title: "WarmDispatchResult"
description: "WarmDispatchResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WarmDispatchResult**. Consultez le [guide dispatch](../../agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WarmDispatchResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WarmDispatchResult<T> extends Omit<
  DispatchResult<T>,
  "resume" | "fork"
> {
  resume<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
  fork<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
}
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
