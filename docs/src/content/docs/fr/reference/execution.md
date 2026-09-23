---
title: "Execution"
description: "Execution — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Execution**. Consultez le [guide dispatch](../../agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [Turn](../turn/)
- [Usage](../usage/)
