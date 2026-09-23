---
title: "Turn"
description: "Turn — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Turn**. Consultez le [guide dispatch](../../agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [Usage](../usage/)
