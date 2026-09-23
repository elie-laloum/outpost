---
title: "Issue"
description: "Issue — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Issue**. Consultez le [guide campagnes et backlogs](../../workflows/campaigns/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Issue } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Issue {
  readonly id: string;
  readonly title: string;
  readonly body?: string;
  readonly blockedBy?: readonly string[];
}
```
