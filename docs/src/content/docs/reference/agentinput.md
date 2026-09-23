---
title: "AgentInput"
description: "AgentInput — Outpost API"
sidebar:
  order: 10
---

Public contract for **AgentInput**. See the [agents guide](../../agents/adapters/) for behavior, defaults and examples.

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
