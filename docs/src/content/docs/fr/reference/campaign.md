---
title: "campaign"
description: "campaign — Outpost API"
sidebar:
  order: 10
---

Contrat public de **campaign**. Consultez le [guide campagnes et backlogs](../../workflows/campaigns/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [CampaignOptions](../campaignoptions/)
- [CampaignResult](../campaignresult/)
