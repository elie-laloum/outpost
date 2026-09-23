---
title: "CampaignResult"
description: "CampaignResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **CampaignResult**. See the [campaigns and backlogs guide](../../workflows/campaigns/) for behavior, defaults and examples.

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

## Related contracts

- [IssueOutcome](../issueoutcome/)
