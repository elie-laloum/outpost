---
title: "DispatchOptions"
description: "DispatchOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **DispatchOptions**. Consultez le [guide dispatch](../../agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { DispatchOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface DispatchOptions<T = undefined> {
  readonly agent?: AgentAdapter;
  readonly logging?: Logging;
  readonly label?: string;
  readonly brief: Brief;
  readonly passes?: number;
  readonly until?: string | readonly string[];
  readonly idleMs?: number;
  readonly idleWarningMs?: number;
  readonly settleMs?: number;
  readonly deadlineMs?: number;
  readonly expansionMs?: number;
  readonly signal?: AbortSignal;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
  readonly response?: ResponseSpec<T>;
  readonly observe?: (event: AgentObservation) => void;
  readonly warn?: (message: string) => void;
  readonly diagnostic?: (message: string) => void;
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [AgentObservation](../agentobservation/)
- [Brief](../brief/)
- [Logging](../logging/)
- [ResponseSpec](../responsespec/)
