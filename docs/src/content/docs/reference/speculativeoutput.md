---
title: "SpeculativeOutput"
description: "SpeculativeOutput — Outpost API"
sidebar:
  order: 10
---

Public contract for **SpeculativeOutput**. See the [speculative execution guide](../../workflows/speculation/) for behavior, defaults and examples.

## Import

```ts
import type { SpeculativeOutput } from "@elie-laloum/outpost";
```

## Signature

```ts
export type SpeculativeOutput<T> = Omit<
  WarmDispatchResult<T>,
  "resume" | "fork"
>;
```

## Related contracts

- [WarmDispatchResult](../warmdispatchresult/)
