---
title: "campaign"
description: "campaign — Outpost API"
sidebar:
  order: 10
---

Public contract for **campaign**. See the [campaigns and backlogs guide](../../workflows/campaigns/) for behavior, defaults and examples.

## Import

```ts
import { campaign } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function campaign(
  options: CampaignOptions,
): Promise<CampaignResult>;
```

## Related contracts

- [CampaignOptions](../campaignoptions/)
- [CampaignResult](../campaignresult/)
