---
title: "Turn"
description: "Turn — Outpost API"
sidebar:
  order: 10
---

Public contract for **Turn**. See the [dispatch guide](../../agents/dispatch/) for behavior, defaults and examples.

## Import

```ts
import type { Turn } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Turn {
  readonly text: string;
  readonly status: number;
  readonly conversation?: string;
  readonly transcript?: string;
  readonly usage: Usage;
  readonly durationMs: number;
}
```

## Related contracts

- [Usage](../usage/)
