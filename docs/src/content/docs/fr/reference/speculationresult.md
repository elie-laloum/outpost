---
title: "SpeculationResult"
description: "SpeculationResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SpeculationResult**. Consultez le [guide exécution spéculative](../../workflows/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SpeculationResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface SpeculationResult<T = undefined> {
  readonly id: string;
  readonly baseline: string;
  readonly host: {
    readonly before: SpeculativeHostSnapshot;
    readonly after?: SpeculativeHostSnapshot;
    readonly changed: boolean;
    readonly error?: unknown;
  };
  readonly status: "winner" | "no-winner" | "aborted" | "budget-exhausted";
  readonly winner?: SpeculativeCandidateResult<T>;
  readonly candidates: readonly SpeculativeCandidateResult<T>[];
  readonly usage: WorkflowUsage;
  readonly error?: unknown;
}
```

## Contrats associés

- [SpeculativeCandidateResult](../speculativecandidateresult/)
- [SpeculativeHostSnapshot](../speculativehostsnapshot/)
- [WorkflowUsage](../workflowusage/)
