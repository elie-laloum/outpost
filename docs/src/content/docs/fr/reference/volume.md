---
title: "Volume"
description: "Volume — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Volume**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Volume } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Volume {
  readonly source: string;
  readonly target: string;
  readonly readOnly?: boolean;
}
```
