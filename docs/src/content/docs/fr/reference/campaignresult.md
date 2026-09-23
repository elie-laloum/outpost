---
title: "CampaignResult"
description: "CampaignResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **CampaignResult**. Consultez le [guide campagnes et backlogs](../../workflows/campaigns/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { CampaignResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface CampaignResult {
  readonly cycles: number;
  readonly reason: "empty" | "blocked" | "no-progress" | "limit";
  readonly issues: readonly IssueOutcome[];
}
```

## Contrats associés

- [IssueOutcome](../issueoutcome/)
