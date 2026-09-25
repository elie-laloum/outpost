---
title: "SpeculativeCandidate"
description: "SpeculativeCandidate — Outpost API"
sidebar:
  order: 10
---

Public contract for **SpeculativeCandidate**. See the [speculative execution guide](../../guide/advanced/speculation/) for behavior, defaults and examples.

## Import

```ts
import type { SpeculativeCandidate } from "@elie-laloum/outpost";
```

## Purpose and behavior

Race bounded candidate branches and select the first one that passes explicit validation and cleanup.

Research prototype: at most eight candidates, default concurrency two. No automatic integration, push or durable race resumption. Observed usage is not a billing cap.

[Complete example and detailed rules](../../guide/advanced/speculation/).

## Parameters and properties

| Name      | Type                                                              | Presence | Meaning                                                                 |
| --------- | ----------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `key`     | `string`                                                          | Required | Stable task or cache key within its owning contract.                    |
| `agent`   | `AgentAdapter`                                                    | Required | Native coding-agent adapter.                                            |
| `request` | `Omit<DispatchOptions<T>, "signal" \| "agent" \| "continuation">` | Required | See the linked contract and this family's rules for its interpretation. |

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
