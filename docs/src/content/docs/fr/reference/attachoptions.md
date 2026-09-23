---
title: "AttachOptions"
description: "AttachOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AttachOptions**. Consultez le [guide commandes et terminal](../../sandboxes/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AttachOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface AttachOptions {
  readonly ask?: VariableQuestion;
  readonly agent?: AgentAdapter;
  readonly brief?: Brief;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
  readonly signal?: AbortSignal;
  readonly terminal?: Command["terminal"];
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [Brief](../brief/)
- [Command](../command/)
- [VariableQuestion](../variablequestion/)
