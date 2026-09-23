---
title: "CampaignEvent"
description: "CampaignEvent — Outpost API"
sidebar:
  order: 10
---

Public contract for **CampaignEvent**. See the [campaigns and backlogs guide](../../workflows/campaigns/) for behavior, defaults and examples.

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
