---
title: "SpeculationResult"
description: "SpeculationResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **SpeculationResult**. See the [speculative execution guide](../../workflows/speculation/) for behavior, defaults and examples.

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

## Related contracts

- [SpeculativeCandidateResult](../speculativecandidateresult/)
- [SpeculativeHostSnapshot](../speculativehostsnapshot/)
- [WorkflowUsage](../workflowusage/)
