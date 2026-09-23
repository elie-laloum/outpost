---
title: "CampaignEvent"
description: "CampaignEvent — Outpost API"
sidebar:
  order: 10
---

Contrat public de **CampaignEvent**. Consultez le [guide campagnes et backlogs](../../workflows/campaigns/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { CampaignEvent } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface CampaignEvent {
  readonly phase:
    "backlog" | "plan" | "implement" | "review" | "merge" | "close";
  readonly cycle: number;
  readonly issue?: string;
}
```
