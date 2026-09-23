---
title: "BacklogSettings"
description: "BacklogSettings — Outpost API"
sidebar:
  order: 10
---

Contrat public de **BacklogSettings**. Consultez le [guide campagnes et backlogs](../../workflows/campaigns/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { BacklogSettings } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface BacklogSettings {
  readonly directory?: string;
  readonly label?: string;
  readonly deadlineMs?: number;
}
```
