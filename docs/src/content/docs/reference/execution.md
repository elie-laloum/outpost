---
title: "Execution"
description: "Execution — Outpost API"
sidebar:
  order: 10
---

Public contract for **Execution**. See the [dispatch guide](../../agents/dispatch/) for behavior, defaults and examples.

## Import

```ts
import type { Execution } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Execution<T> {
  readonly text: string;
  readonly turns: readonly Turn[];
  readonly usage: Usage;
  readonly conversation?: string;
  readonly value: T;
  readonly completed: boolean;
  readonly completion?: string;
}
```

## Related contracts

- [Turn](../turn/)
- [Usage](../usage/)
