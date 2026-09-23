---
title: "StageLimits"
description: "StageLimits — Outpost API"
sidebar:
  order: 10
---

Contrat public de **StageLimits**. Consultez le [guide workspaces](../../sandboxes/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { StageLimits } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface StageLimits {
  readonly copyMs?: number;
  readonly gitMs?: number;
  readonly collectMs?: number;
  readonly mergeMs?: number;
}
```
