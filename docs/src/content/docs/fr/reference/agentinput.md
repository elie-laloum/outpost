---
title: "AgentInput"
description: "AgentInput — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AgentInput**. Consultez le [guide agents](../../agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AgentInput } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface AgentInput {
  readonly text?: string;
  readonly interactive?: boolean;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
}
```
