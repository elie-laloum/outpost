---
title: "AgentObservation"
description: "AgentObservation — Outpost API"
sidebar:
  order: 10
---

Public contract for **AgentObservation**. See the [observability guide](../../agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { AgentObservation } from "@elie-laloum/outpost";
```

## Signature

```ts
export type AgentObservation = AgentEvent & {
  readonly pass: number;
  readonly at: string;
};
```

## Related contracts

- [AgentEvent](../agentevent/)
