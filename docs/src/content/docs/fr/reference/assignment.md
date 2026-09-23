---
title: "Assignment"
description: "Assignment — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Assignment**. Consultez le [guide campagnes et backlogs](../../workflows/campaigns/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Assignment } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Assignment {
  readonly id: string;
  readonly branch: string;
}
```
