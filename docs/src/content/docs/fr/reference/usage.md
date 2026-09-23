---
title: "Usage"
description: "Usage — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Usage**. Consultez le [guide observabilité](../../agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Usage } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Usage {
  readonly input: number;
  readonly cached: number;
  readonly cacheCreated?: number;
  readonly output: number;
}
```
