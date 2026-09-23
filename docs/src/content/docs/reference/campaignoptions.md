---
title: "CampaignOptions"
description: "CampaignOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **CampaignOptions**. See the [campaigns and backlogs guide](../../workflows/campaigns/) for behavior, defaults and examples.

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

## Related contracts

- [AgentAdapter](../agentadapter/)
- [Backlog](../backlog/)
- [CampaignEvent](../campaignevent/)
- [SandboxOptions](../sandboxoptions/)
