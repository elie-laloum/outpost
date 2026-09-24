---
title: "SpeculativeCandidate"
description: "SpeculativeCandidate — Outpost API"
sidebar:
  order: 10
---

Public contract for **SpeculativeCandidate**. See the [speculative execution guide](../../workflows/speculation/) for behavior, defaults and examples.

## Import

```ts
import type { SpeculativeCandidate } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface SpeculativeCandidate<T = undefined> {
  readonly key: string;
  readonly agent: AgentAdapter;
  readonly request: Omit<
    DispatchOptions<T>,
    "agent" | "signal" | "continuation"
  >;
}
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [DispatchOptions](../dispatchoptions/)
