---
title: "CampaignOptions"
description: "CampaignOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **CampaignOptions**. Consultez le [guide campagnes et backlogs](../../workflows/campaigns/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { CampaignOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface CampaignOptions extends Omit<
  SandboxOptions,
  "workspace" | "branch" | "agent"
> {
  readonly agent: AgentAdapter;
  readonly backlog: Backlog;
  readonly planner?: AgentAdapter | false;
  readonly reviewer?: AgentAdapter | false;
  readonly merger?: AgentAdapter;
  readonly cycles?: number;
  readonly concurrency?: number;
  readonly implementationPasses?: number;
  readonly reviewPasses?: number;
  readonly standards?: string;
  readonly observe?: (event: CampaignEvent) => void;
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [Backlog](../backlog/)
- [CampaignEvent](../campaignevent/)
- [SandboxOptions](../sandboxoptions/)
